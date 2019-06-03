// This is a sample component. It's only purpose is
// to show how to use styles and other available features.

import React, { useState, useEffect, PropsWithChildren, ReactElement } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'inline-block',
    border: '1px solid blue',
    borderRadius: 5,
    margin: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.extraColors.backupRegister,
    color: theme.palette.text.primary
  }
}));

export interface SomeExtraDefinitions {}

interface SomeOtherExtraDefinitions {}

export interface SampleGenericComponentProps<T extends number> {
  someRequiredProp: T;
  someOptionalProp?: boolean;
}

const SampleGenericComponent = <T extends number>(props: PropsWithChildren<SampleGenericComponentProps<T>>): ReactElement | null => {
  const { someRequiredProp, someOptionalProp } = props;

  const [stateVariable, setStateVariable] = useState(123);
  const [anotherStateVariable, setAnotherVariable] = useState('initial data');

  useEffect(() => {
    // make effects...
    return () => {
      // close up...
    };
  });

  const classes = useStyles();
  const theme = useTheme();

  return <div className={classes.root}>Sample Generic Component</div>;
};

SampleGenericComponent.defaultProps = {};

export default SampleGenericComponent;

function someHelperMethod() {}
