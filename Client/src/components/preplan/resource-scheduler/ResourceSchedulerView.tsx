import React, { PureComponent } from 'react';
import { WithStyles, Theme, createStyles, withStyles } from '@material-ui/core/styles';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      border: '1px solid red',
      width: '100%',
      height: 'calc(100vh - 158px)',
      backgroundColor: 'yellow'
    }
  });

interface Props extends WithStyles<typeof styles> {}
interface State {}

class FlightRequirementModal extends PureComponent<Props, State> {
  render() {
    const { classes } = this.props;

    return <div className={classes.root}>vis.js</div>;
  }
}

export default withStyles(styles)(FlightRequirementModal);
