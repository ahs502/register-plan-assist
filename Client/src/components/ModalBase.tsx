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

export interface ModalBaseModel {
  open?: boolean;
  loading?: boolean;
  errorMessage?: string;
}

export interface ModalAction {
  title: string;
  action?(): void;
}

export interface ModalBaseProps<M extends ModalBaseModel> extends Omit<DraggableDialogProps, 'open'> {
  model: M;
  complexTitle?: ReactElement;
  cancelable?: boolean;
  onClose(): void;
  actions?: ModalAction[];
}

const ModalBase: FC<ModalBaseProps<ModalBaseModel>> = ({ children, model, title, complexTitle, cancelable, onClose, actions, ...other }) => {
  if (cancelable && !onClose) throw 'Cancelable ModalBases need onClose handler to be defined.';

  const classes = useStyles();

  return (
    <DraggableDialog
      {...other}
      aria-labelledby="form-dialog-title"
      open={model.open || false}
      disableBackdropClick={model.loading || !cancelable}
      disableEscapeKeyDown={model.loading || !cancelable}
      onClose={onClose}
    >
      <DialogTitle className={model.loading ? classes.disable : ''} id="form-dialog-title">
        {title ? title : complexTitle}
      </DialogTitle>
      <DialogContent>
        <div className={classNames(model.loading ? classes.disable : '')}>{children}</div>
        {model.loading && <CircularProgress size={24} className={classes.progress} />}
        {model.errorMessage && (
          <Paper className={classNames(classes.paperError, classes.marginTop2)}>
            <Typography className={classes.error} component="p" variant="body1" color="error">
              {model.errorMessage}
            </Typography>
          </Paper>
        )}
      </DialogContent>
      {actions && (
        <DialogActions>
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={() => {
                const handler = action.action || onClose;
                handler && handler();
              }}
              disabled={model.loading}
              color="primary"
            >
              {action.title}
            </Button>
          ))}
        </DialogActions>
      )}
    </DraggableDialog>
  );
};

export default ModalBase;

export function useModalViewModel<ViewModel>(
  open: boolean | undefined,
  defaultViewModel: ViewModel,
  viewModelFactory?: (previousViewModel: ViewModel) => ViewModel | false | undefined | null
): [ViewModel, Dispatch<SetStateAction<ViewModel>>] {
  const state = useState<ViewModel>(defaultViewModel);
  const [viewModel, setViewModel] = state;
  useEffect(() => {
    if (!open) return;
    const newViewModel = viewModelFactory ? viewModelFactory(viewModel) : defaultViewModel;
    if (!newViewModel) return;
    setViewModel(newViewModel);
  }, [open]);
  return state;
}
