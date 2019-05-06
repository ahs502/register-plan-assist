import React, { PureComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      border: '1px solid green',
      backgroundColor: theme.palette.grey[300],
      margin: 0,
      padding: theme.spacing.unit * 2
    }
  });

interface Props extends WithStyles<typeof styles> {}

class NavBar extends PureComponent<Props> {
  render() {
    const { classes, children } = this.props;

    return (
      <div className={classes.root}>
        Nav Bar&nbsp;&nbsp;<strong>{children}</strong>
      </div>
    );
  }
}

export default withStyles(styles)(NavBar);
