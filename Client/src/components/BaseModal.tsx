import React, { FC, ReactElement, useState, useEffect, Dispatch, SetStateAction, Fragment, PropsWithChildren } from 'react';
import { Theme, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import DraggableDialog, { DraggableDialogProps } from 'src/components/DraggableDialog';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  disable: {
    opacity: 0.5
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  },
  marginTop2: {
    marginTop: theme.spacing(2)
  },
  error: {
    padding: theme.spacing(1.5, 1.5, 1.5, 3)
  },
  paperError: {
    boxShadow: '0px 1px 3px 0px rgba(255, 0, 0, 0.2), 0px 1px 1px 0px rgba(255, 0, 0, 0.14), 0px 2px 1px -1px rgba(255, 0, 0, 0.12)'
  }
}));

export interface ModalAction {
  title: string;
  action?(): void | Promise<void>;
  invisible?: boolean;
  disabled?: boolean;
  notClosing?: boolean;
}

export interface BaseModalProps<State> extends Omit<DraggableDialogProps, 'open' | 'title'> {
  state: State | undefined;
  onClose(): void | Promise<void>;
}

interface ActualBaseModalProps<State, ViewState> extends Omit<BaseModalProps<State>,'state'> {
  state:State;
  viewState: ViewState ;
  cancelable?: boolean;
  title?: string ;
  complexTitle?: ReactElement | undefined | null | false;
  actions?: ModalAction[];
}

const BaseModal = <State, ViewState>({
  children,
  state,
  viewState,
  cancelable,
  title,
  complexTitle,
  onClose,
  actions:modalActions,
  ...others
}: PropsWithChildren<ActualBaseModalProps<State, ViewState>>): ReactElement | null => {
  const [{ loading, errorMessage }, setViewState] = useState<{ loading: boolean; errorMessage: string }>({ loading: false, errorMessage: '' });

  const open = !!viewState;

  useEffect(() => {
    if (!open || (!loading && !errorMessage)) return;
    setViewState({ loading: false, errorMessage: '' });
  }, [open]);

  const classes = useStyles();

  return (
    <DraggableDialog
      {...others}
      aria-labelledby="form-dialog-title"
      open={open}
      disableBackdropClick={loading || !cancelable}
      disableEscapeKeyDown={loading || !cancelable}
      onClose={handleLoader(onClose)}
    >
      {open && (
        <Fragment>
          <DialogTitle className={loading ? classes.disable : ''} id="form-dialog-title">
            {title||complexTitle}
          </DialogTitle>
          <DialogContent>
            <div className={classNames(loading ? classes.disable : '')}>
              {body({
                ...supplement,
                tryToSubmit: e => {
                  if (e && (e.which !== 13 || e.altKey || e.ctrlKey || e.shiftKey)) return;
                  handleLoader(modalActions && modalActions.length > 0 ? fullAction(modalActions[modalActions.length - 1]) : onClose);
                }
              })}
            </div>
            {loading && <CircularProgress size={24} className={classes.progress} />}
            {errorMessage && (
              <Paper className={classNames(classes.paperError, classes.marginTop2)}>
                <Typography className={classes.error} component="p" variant="body1" color="error">
                  {errorMessage}
                </Typography>
              </Paper>
            )}
          </DialogContent>
          {modalActions && (
            <DialogActions>
              {modalActions
                .filter(action => !action.invisible)
                .map((modalAction, index) => (
                  <Button key={index} color="primary" disabled={modalAction.disabled || loading} onClick={handleLoader(fullAction(modalAction))}>
                    {modalAction.title}
                  </Button>
                ))}
            </DialogActions>
          )}
        </Fragment>
      )}
    </DraggableDialog>
  );

  function fullAction({ action, notClosing }: ModalAction): () => Promise<void> {
    return async () => {
      if (!action) return onClose();
      try {
        await action();
        if (notClosing) return;
        return onClose();
      } catch (reason) {
        // Do not close the modal when some exception occurs in the action.
        console.error(reason);
        throw reason;
      }
    };
  }

  function handleLoader(action: () => void | Promise<void>): () => void {
    return () => {
      const result = action();
      if (!(result instanceof Promise)) {
        if (!loading && !errorMessage) return;
        setViewState({ loading: false, errorMessage: '' });
        return;
      }
      setViewState({ loading: true, errorMessage: '' });
      result.then(
        () => setViewState({ loading: false, errorMessage: '' }),
        reason => setViewState({ loading: false, errorMessage: String(reason) })
      );
    };
  }
};

export default BaseModal;

export function useModalState<State>(): [State | undefined, (state: State) => void, () => void] {
  const [state, setState] = useState<State | undefined>(undefined);
  return [state, state => setState(state), () => setState(undefined)];
}

export function useModalViewState<State, ViewState>(
  state: State | undefined,
  viewStateProvider: (state: State) => ViewState | false | undefined | null
): [ViewState | undefined, Dispatch<SetStateAction<ViewState>>] {
  const [viewState, setViewState] = useState<ViewState | undefined>(undefined);

  useEffect(() => {
    setViewState((state && viewStateProvider(state)) || undefined);
  }, [!!state]);

  return [
    viewState,
    setViewStateAction =>
      viewState && setViewState(typeof setViewStateAction === 'function' ? (setViewStateAction as (previousViewState: ViewState) => ViewState)(viewState) : setViewStateAction)
  ];
}

export function createModal<State, ViewState>(state:State|undefined,viewState:ViewState|undefined,descriptor:(props:ActualBaseModalProps)):JSX.Element{
  
}