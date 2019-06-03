import React, { FC, useState } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField } from '@material-ui/core';
import DraggableDialog from '../DraggableDialog';
import FlightRequirement, { FlightRequirementModel } from '../../business/FlightRequirement';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface FlightRequirementModalProps {
  model?: FlightRequirementModel;
  open: boolean;
  onSubmit: (model: FlightRequirementModel) => void;
  onDismiss: () => void;
}

const FlightRequirementModal: FC<FlightRequirementModalProps> = ({ model, open, onSubmit, onDismiss }) => {
  const [label, setLabel] = useState((model && model.definition.label) || '');

  const handleSubmit = () => {
    // const { label } = this.state;
    const model: FlightRequirementModel = {} as any; //TODO: Not implemented.
    onSubmit(model);
  };

  return (
    <DraggableDialog open={open} onClose={onDismiss} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
      <DialogContent>
        <DialogContentText>To subscribe to this website, please enter your email address here. We will send updates occasionally.</DialogContentText>
        <TextField autoFocus margin="dense" id="name" label="Email Address" type="email" fullWidth />
      </DialogContent>
      <DialogActions>
        <Button onClick={onDismiss} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Subscribe
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
};

export default FlightRequirementModal;
