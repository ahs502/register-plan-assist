// This is a sample component. It's only purpose is
// to show how to use styles and other available features.

import React, { PureComponent /* or Component */ } from 'react';
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

export interface SomeExternalDeclaration {}

interface SomeInternalDeclaration {}

interface Props extends WithStyles<typeof styles> {}
interface State {
  value: string;
}

class SampleClassComponent extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      value: 'something'
    };
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return <div className={classes.root}>Some Button ({value})</div>;
  }

  static defaultProps: Partial<Props> = {};
}

export default withStyles(styles)(SampleClassComponent);

function someHelperMethod() {}
