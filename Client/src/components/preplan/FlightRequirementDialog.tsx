import React, { PureComponent } from 'react';
import { WithStyles, Theme, createStyles, withStyles } from '@material-ui/core/styles';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField } from '@material-ui/core';
import DraggableDialog from '../DraggableDialog';
import FlightRequirement from '../../business/FlightRequirement';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {
  flightRequirement?: FlightRequirement;
  open: boolean;
  onSubmit: (FlightRequirement: FlightRequirement) => void;
  onDismiss: () => void;
}
interface State {
  label: string;
}

class FlightRequirementDialog extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    if (props.flightRequirement) {
      let flightRequirement = props.flightRequirement as FlightRequirement;
      this.state = {
        label: flightRequirement.label
      };
    } else {
      this.state = {
        label: ''
      };
    }
  }

  handleSubmit = () => {
    const { onSubmit } = this.props;
    const { label } = this.state;
    const flightRequirement: FlightRequirement = {
      label
    };
    onSubmit(flightRequirement);
  };

  render() {
    const { open, onDismiss } = this.props;

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
          <Button onClick={this.handleSubmit} color="primary">
            Subscribe
          </Button>
        </DialogActions>
      </DraggableDialog>
    );
  }
}

export default withStyles(styles)(FlightRequirementDialog);
