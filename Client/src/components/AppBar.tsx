import React, { PureComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      border: '1px solid ' + theme.palette.primary.dark,
      backgroundColor: theme.palette.primary.main,
      margin: 0,
      padding: theme.spacing.unit * 2
    }
  });

interface Props extends WithStyles<typeof styles> {}

class AppBar extends PureComponent<Props> {
  render() {
    const { classes } = this.props;

    return <div className={classes.root}>App Bar</div>;
  }
}

export default withStyles(styles)(AppBar);
