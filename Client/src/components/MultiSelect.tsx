import React, { FunctionComponent } from 'react';
import { WithStyles, withStyles, createStyles, Theme } from '@material-ui/core/styles';
import MuiReactSelect, { Suggestion } from './MuiReactSelect';
import { ValueType } from 'react-select/lib/types';

const styles = (theme: Theme) =>
  createStyles({
    wrapper: {
      display: 'flex',
      alignItems: 'flex-end'
    },
    space: {
      width: theme.spacing.unit
    },
    root: {}
  });

export interface MultiSelectProps extends WithStyles<typeof styles> {
  label?: string;
  placeholder?: string;
  suggestions?: ReadonlyArray<Suggestion>;
  value?: ReadonlyArray<Suggestion>;
  onChange?: (value?: ReadonlyArray<Suggestion>) => void;
}

const MultiSelect: FunctionComponent<MultiSelectProps> = ({ label, placeholder, suggestions, value, onChange, classes }: MultiSelectProps) => {
  function handleChange(value: ValueType<Suggestion>) {
    if (typeof onChange !== 'function') return;
    onChange(value ? (value as ReadonlyArray<Suggestion>) : undefined);
  }

  return <MuiReactSelect classes={{ root: classes.root }} label={label} placeholder={placeholder} suggestions={suggestions} value={value} onChange={handleChange} isMulti />;
};

export default withStyles(styles)(MultiSelect);
