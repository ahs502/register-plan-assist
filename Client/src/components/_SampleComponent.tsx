// This is a sample component. It's only purpose is
// to show how to use styles and other available features.

// All imports, sorted by more to less general then ui to business:
import React, { FC, useState, useEffect } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/styles';

// Our custom styles:
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

// Public definitions:
export interface SomeExtraDefinitions {}

// Internal definitions:
interface SomeOtherExtraDefinitions {}

// Component props type:
export interface SampleComponentProps {
  someRequiredProp: number;
  someOptionalProp?: boolean;
}

// Component body:
const SampleComponent: FC<SampleComponentProps> = ({ someRequiredProp, someOptionalProp }) => {
  // All state or reducer hooks:
  const [stateVariable, setStateVariable] = useState(123);
  const [anotherStateVariable, setAnotherVariable] = useState('initial data');

  // All side effect hooks:
  useEffect(() => {
    // make effects...
    return () => {
      // close up...
    };
  });

  // All third party hooks:
  const classes = useStyles();
  const theme = useTheme();

  // All functions with inner use:
  function handleClick() {
    //...
  }

  // Make the virtual DOM:
  return (
    <div className={classes.root} onClick={handleClick}>
      Sample Component
    </div>
  );
};

// Default values of props when not provided by the user (only for optional props):
SampleComponent.defaultProps = {};

// Export the component as the default export:
export default SampleComponent;

// Any other extra helpers:
function someHelperMethod() {}
