import React, { PureComponent } from 'react';
import { WithStyles, Theme, createStyles, withStyles } from '@material-ui/core/styles';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      width: theme.spacing.unit * 60
    },
    label: {
      border: '1px solid black',
      backgroundColor: theme.palette.grey[300],
      margin: 0,
      padding: theme.spacing.unit * 2
    },
    contents: {
      margin: 0,
      padding: theme.spacing.unit * 2
    }
  });

interface Props extends WithStyles<typeof styles> {
  label?: string;
}
interface State {}

class SideBarContainer extends PureComponent<Props, State> {
  render() {
    const { classes, label, children } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.label}>{label}</div>
        <div className={classes.contents}>{children}</div>
      </div>
    );
  }
}

export default withStyles(styles)(SideBarContainer);
