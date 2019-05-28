import React, { FunctionComponent, CSSProperties, HTMLAttributes } from 'react';
import { Theme, withTheme, WithTheme } from '@material-ui/core/styles';
import { createStyles, makeStyles } from '@material-ui/styles';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import { Paper, Chip, MenuItem, Typography } from '@material-ui/core';
import TextField, { BaseTextFieldProps } from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import Select from 'react-select';
import { ValueContainerProps } from 'react-select/lib/components/containers';
import { ControlProps } from 'react-select/lib/components/Control';
import { MenuProps, NoticeProps } from 'react-select/lib/components/Menu';
import { MultiValueProps } from 'react-select/lib/components/MultiValue';
import { OptionProps } from 'react-select/lib/components/Option';
import { PlaceholderProps } from 'react-select/lib/components/Placeholder';
import { SingleValueProps } from 'react-select/lib/components/SingleValue';
import { ValueType } from 'react-select/lib/types';
import classNames from 'classnames';

export interface Suggestion {
  label: string;
  value: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      height: 250
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
      margin: `${theme.spacing.unit * 0.5}px ${theme.spacing.unit * 0.25}px`
    },
    chipFocused: {
      backgroundColor: emphasize(theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700], 0.08)
    },
    noOptionsMessage: {
      padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`
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
      marginTop: theme.spacing.unit,
      left: 0,
      right: 0
    },
    divider: {
      height: theme.spacing.unit * 2
    }
  })
);

type NoOptionsMessageComponentProps = NoticeProps<Suggestion>;
const NoOptionsMessage: FunctionComponent<NoOptionsMessageComponentProps> = (props: NoOptionsMessageComponentProps) => (
  <Typography color="textSecondary" className={props.selectProps.classes.noOptionsMessage} {...props.innerProps}>
    {props.children}
  </Typography>
);

type InputComponentProps = Pick<BaseTextFieldProps, 'inputRef'> & HTMLAttributes<HTMLDivElement>;
const inputComponent: FunctionComponent<InputComponentProps> = ({ inputRef, ...props }: InputComponentProps) => <div ref={inputRef} {...props} />;

type ControlComponentProps = ControlProps<Suggestion>;
const Control: FunctionComponent<ControlComponentProps> = (props: ControlComponentProps) => (
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

type OptionComponenetProps = OptionProps<Suggestion>;
const Option: FunctionComponent<OptionComponenetProps> = (props: OptionComponenetProps) => (
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

type PlaceholderComponentProps = PlaceholderProps<Suggestion>;
const Placeholder: FunctionComponent<PlaceholderComponentProps> = (props: PlaceholderComponentProps) => (
  <Typography color="textSecondary" className={props.selectProps.classes.placeholder} {...props.innerProps}>
    {props.children}
  </Typography>
);

type SingleValueComponentProps = SingleValueProps<Suggestion>;
const SingleValue: FunctionComponent<SingleValueComponentProps> = (props: SingleValueComponentProps) => (
  <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
    {props.children}
  </Typography>
);

type ValueContainerComponentProps = ValueContainerProps<Suggestion>;
const ValueContainer: FunctionComponent<ValueContainerComponentProps> = (props: ValueContainerComponentProps) => (
  <div className={props.selectProps.classes.valueContainer}>{props.children}</div>
);

type MultiValueComponentProps = MultiValueProps<Suggestion>;
const MultiValue: FunctionComponent<MultiValueComponentProps> = (props: MultiValueComponentProps) => (
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

type MenuComponentProps = MenuProps<Suggestion>;
const Menu: FunctionComponent<MenuComponentProps> = (props: MenuComponentProps) => (
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

export interface MuiReactSelectProps extends WithTheme {
  label?: string;
  placeholder?: string;
  suggestions?: ReadonlyArray<Suggestion>;
  value: ValueType<Suggestion>;
  onChange?: (value: ValueType<Suggestion>) => void;
  isMulti?: boolean;
}

const MuiReactSelect: FunctionComponent<MuiReactSelectProps> = ({ theme, label, placeholder, suggestions, value, onChange, isMulti }: MuiReactSelectProps) => {
  const classes = useStyles();

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
      classes={classes}
      styles={selectStyles}
      TextFieldProps={isMulti ? { label, InputLabelProps: { shrink: true } } : { label }}
      options={suggestions}
      components={components}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isMulti={isMulti}
    />
  );
};

export default withTheme()(MuiReactSelect);
