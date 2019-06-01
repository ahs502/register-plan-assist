import React, { PureComponent } from 'react';
import { WithStyles, Theme, createStyles, withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      width: theme.spacing.unit * 60
    },
    label: {
      border: 'solid',
      borderleft: '1px',
      borderTopWidth: '1px',
      borderBottomWidth: '1px',
      borderLeftWidth: '0px',
      borderRightWidth: '0px',
      borderColor: theme.palette.grey[400],
      backgroundColor: theme.palette.grey[200],
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
        <div className={classes.label}>
          <Typography> {label}</Typography>
        </div>
        <div className={classes.contents}>{children}</div>
      </div>
    );
  }
}

export default withStyles(styles)(SideBarContainer);
