import React, { FC, CSSProperties, HTMLAttributes, PropsWithChildren, ReactElement } from 'react';
import { Theme, Paper, Chip, MenuItem, Typography } from '@material-ui/core';
import TextField, { BaseTextFieldProps } from '@material-ui/core/TextField';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import { makeStyles, useTheme } from '@material-ui/styles';
import { Cancel as CancelIcon } from '@material-ui/icons';
import Select from 'react-select';
import { Props as StatemanagerProps } from 'react-select/lib/stateManager';
import { Props as SelectProps } from 'react-select/lib/Select';
import { ValueContainerProps } from 'react-select/lib/components/containers';
import { ControlProps } from 'react-select/lib/components/Control';
import { MenuProps, NoticeProps } from 'react-select/lib/components/Menu';
import { MultiValueProps } from 'react-select/lib/components/MultiValue';
import { OptionProps } from 'react-select/lib/components/Option';
import { PlaceholderProps } from 'react-select/lib/components/Placeholder';
import { SingleValueProps } from 'react-select/lib/components/SingleValue';
import { ValueType, ActionMeta } from 'react-select/lib/types';
import classNames from 'classnames';
import { getOptionLabel, getOptionValue } from 'react-select/lib/builtins';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1
  },
  input: {
    display: 'flex',
    padding: 0,
    height: 'auto'
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden'
  },
  chip: {
    margin: theme.spacing(0.5, 0.25)
  },
  chipFocused: {
    backgroundColor: emphasize(theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700], 0.08)
  },
  noOptionsMessage: {
    padding: theme.spacing(1, 2)
  },
  singleValue: {
    fontSize: 16
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    bottom: 6,
    fontSize: 16
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0
  },
  divider: {
    height: theme.spacing(2)
  }
}));

const NoOptionsMessage = <T extends {}>(props: NoticeProps<T>): ReactElement | null => (
  <Typography color="textSecondary" className={props.selectProps.classes.noOptionsMessage} {...props.innerProps}>
    {props.children}
  </Typography>
);

type InputComponentProps = Pick<BaseTextFieldProps, 'inputRef'> & HTMLAttributes<HTMLDivElement>;
const inputComponent: FC<InputComponentProps> = ({ inputRef, ...props }: InputComponentProps) => <div ref={inputRef} {...props} />;

const Control = <T extends {}>(props: ControlProps<T>): ReactElement | null => (
  <TextField
    fullWidth
    InputProps={{
      inputComponent,
      inputProps: {
        className: props.selectProps.classes.input,
        inputRef: props.innerRef,
        children: props.children,
        ...props.innerProps
      }
    }}
    {...props.selectProps.TextFieldProps}
  />
);

const Option = <T extends {}>(props: OptionProps<T>): ReactElement | null => (
  <MenuItem
    innerRef={props.innerRef}
    selected={props.isFocused}
    component="div"
    style={{
      fontWeight: props.isSelected ? 500 : 400
    }}
    {...props.innerProps}
  >
    {props.children}
  </MenuItem>
);

const Placeholder = <T extends {}>(props: PlaceholderProps<T>): ReactElement | null => (
  <Typography color="textSecondary" className={props.selectProps.classes.placeholder} {...props.innerProps}>
    {props.children}
  </Typography>
);

const SingleValue = <T extends {}>(props: SingleValueProps<T>): ReactElement | null => (
  <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
    {props.children}
  </Typography>
);

const ValueContainer = <T extends {}>(props: ValueContainerProps<T>): ReactElement | null => <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;

const MultiValue = <T extends {}>(props: MultiValueProps<T>): ReactElement | null => (
  <Chip
    tabIndex={-1}
    label={props.children}
    className={classNames(props.selectProps.classes.chip, {
      [props.selectProps.classes.chipFocused]: props.isFocused
    })}
    onDelete={props.removeProps.onClick}
    deleteIcon={<CancelIcon {...props.removeProps} />}
  />
);

const Menu = <T extends {}>(props: MenuProps<T>): ReactElement | null => (
  <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
    {props.children}
  </Paper>
);

const components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer
};

export interface MuiReactSelectProps<T extends {}> extends StatemanagerProps<T>, SelectProps<T> {
  label?: string;
  isMulti?: boolean;
}

const MuiReactSelect = <T extends {}>({ label, isMulti, ...others }: PropsWithChildren<MuiReactSelectProps<T>>): ReactElement | null => {
  const classes = useStyles();
  const theme = useTheme() as Theme;

  const selectStyles = {
    input: (base: CSSProperties) => ({
      ...base,
      color: theme.palette.text.primary,
      '& input': {
        font: 'inherit'
      }
    })
  };

  return (
    <Select
      className={classes.root}
      classes={classes}
      styles={selectStyles}
      TextFieldProps={
        isMulti ? { label, InputLabelProps: { shrink: true, htmlFor: 'react-select-multiple' } } : { label, InputLabelProps: { shrink: true, htmlFor: 'react-select-single' } }
      }
      components={components}
      isMulti={isMulti}
      {...others}
    />
  );
};

export default MuiReactSelect;
