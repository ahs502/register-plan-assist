import React, { PureComponent } from 'react';
import { WithStyles, Theme, createStyles, withStyles } from '@material-ui/core/styles';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {
  open: boolean;
}
interface State {}

class FlightRequirementModal extends PureComponent<Props, State> {
  render() {
    return <div>Flight Requirement Modal</div>;
  }
}

export default withStyles(styles)(FlightRequirementModal);
