import React, { FC, ReactElement, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Theme, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import DraggableDialog, { DraggableDialogProps } from 'src/components/DraggableDialog';

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
}

export interface BaseModalProps<ModalState extends any> extends Omit<DraggableDialogProps, 'open'> {
  state: [boolean, ModalState];
  complexTitle?: ReactElement;
  cancelable?: boolean;
  onClose(): void | Promise<void>;
  actions?: ModalAction[];
  // discardingConfirmation?: boolean;
}

const BaseModal: FC<Omit<BaseModalProps<any>, 'state'> & { open: boolean }> = ({ children, open, title, complexTitle, cancelable, onClose, actions, ...others }) => {
  const [{ loading, errorMessage }, setViewModel] = useState<{ loading: boolean; errorMessage: string }>({ loading: false, errorMessage: '' });

  useEffect(() => {
    if (!open || (!loading && !errorMessage)) return;
    setViewModel({ loading: false, errorMessage: '' });
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
      <DialogTitle className={loading ? classes.disable : ''} id="form-dialog-title">
        {title ? title : complexTitle}
      </DialogTitle>
      <DialogContent>
        <div className={classNames(loading ? classes.disable : '')}>{children}</div>
        {loading && <CircularProgress size={24} className={classes.progress} />}
        {errorMessage && (
          <Paper className={classNames(classes.paperError, classes.marginTop2)}>
            <Typography className={classes.error} component="p" variant="body1" color="error">
              {errorMessage}
            </Typography>
          </Paper>
        )}
      </DialogContent>
      {actions && (
        <DialogActions>
          {actions.map((action, index) => (
            <Button key={index} onClick={handleLoader(action.action || onClose)} disabled={loading} color="primary">
              {action.title}
            </Button>
          ))}
        </DialogActions>
      )}
    </DraggableDialog>
  );

  function handleLoader(action: () => void | Promise<void>): () => void {
    return () => {
      const result = action();
      if (!(result instanceof Promise)) {
        if (!loading && !errorMessage) return;
        setViewModel({ loading: false, errorMessage: '' });
        return;
      }
      setViewModel({ loading: true, errorMessage: '' });
      result.then(() => setViewModel({ loading: false, errorMessage: '' }), reason => setViewModel({ loading: false, errorMessage: String(reason) }));
    };
  }
};

export default BaseModal;

export function useModalState<ModalState>(): [[boolean, ModalState], (state: ModalState) => void, () => void] {
  const [[open, state], setState] = useState<[boolean, ModalState | undefined]>([false, undefined]);
  return [[open, (state || {}) as any], state => setState([true, state]), () => setState(([open, state]) => [false, state])];
}

export function useModalViewState<ModalViewState>(
  open: boolean,
  defaultViewState: ModalViewState,
  viewStateProvider?: (previousViewState: ModalViewState) => ModalViewState | false | undefined | null
): [ModalViewState, Dispatch<SetStateAction<ModalViewState>>] {
  const viewStateModifier = useState<ModalViewState>(defaultViewState);
  const [viewState, setViewState] = viewStateModifier;
  useEffect(() => {
    if (!open) return;
    const newViewState = viewStateProvider ? viewStateProvider(viewState) || defaultViewState : defaultViewState;
    setViewState(newViewState);
  }, [open]);
  return viewStateModifier;
}
