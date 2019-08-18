import React, { FC, useState, useEffect } from 'react';
import { Theme, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/styles';
import DraggableDialog, { DraggableDialogProps } from './DraggableDialog';
import { green } from '@material-ui/core/colors';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'inline-block',
    border: '1px solid blue',
    borderRadius: 5,
    margin: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.extraColors.backupRegister,
    color: theme.palette.text.primary
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

export interface SimpleModalProps extends DraggableDialogProps {
  open: boolean;
  loading?: boolean;
  title: string;
  errorMessage?: string;
  cancelable?: boolean;
  onClose?(): void;
  actions: ModalAction[];
}

export interface ModalAction {
  title: string;
  action?(): void;
}

const SimpleModal: FC<SimpleModalProps> = ({ children, loading, title, cancelable, onClose, actions: modalActions, ...other }) => {
  if (cancelable && !onClose) throw 'Cancelable SimpleModals need onClose handler to be defined.';
  const classes = useStyles();
  return (
    <DraggableDialog {...other} aria-labelledby="form-dialog-title" disableBackdropClick={loading || !cancelable} disableEscapeKeyDown={loading || !cancelable} onClose={onClose}>
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent>
        {children}
        {loading && <CircularProgress size={24} className={classes.progress} />}
      </DialogContent>
      <DialogActions>
        {modalActions.map(ma => (
          <Button
            onClick={() => {
              const handler = ma.action || onClose;
              handler && handler();
            }}
            color="primary"
          >
            {ma.title}
          </Button>
        ))}
      </DialogActions>
    </DraggableDialog>
  );
};
export default SimpleModal;
