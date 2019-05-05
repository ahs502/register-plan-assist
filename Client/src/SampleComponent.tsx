import React, { FunctionComponent } from 'react';
import {
  WithStyles,
  createStyles,
  withStyles,
  Theme
} from '@material-ui/core/styles';

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
  return <div className={props.classes.root}>Some Button</div>;
};

export default withStyles(styles)(SampleComponent);
