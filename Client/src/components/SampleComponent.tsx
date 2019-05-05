// This is a sample component. It's only purpose is
// to show how to use styles and other available features.

import React, { FunctionComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'inline-block',
      border: '1px solid blue',
      borderRadius: 5,
      margin: theme.spacing.unit * 3,
      padding: theme.spacing.unit * 2,
      backgroundColor: theme.palette.extraColors.backupRegister,
      color: theme.palette.text.primary
    }
  });

interface Props extends WithStyles<typeof styles> {}

const SampleComponent: FunctionComponent<Props> = (props: Props) => {
  const { classes } = props;
  return <div className={classes.root}>Some Button</div>;
};

export default withStyles(styles)(SampleComponent);
