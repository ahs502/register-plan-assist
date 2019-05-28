import React, { FunctionComponent } from 'react';
import MuiReactSelect, { Suggestion } from './MuiReactSelect';
import { ValueType } from 'react-select/lib/types';

export interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  suggestions?: ReadonlyArray<Suggestion>;
  value?: ReadonlyArray<Suggestion>;
  onChange?: (value?: ReadonlyArray<Suggestion>) => void;
}

const MultiSelect: FunctionComponent<MultiSelectProps> = ({ label, placeholder, suggestions, value, onChange }: MultiSelectProps) => {
  function handleChange(value: ValueType<Suggestion>) {
    if (typeof onChange !== 'function') return;
    onChange(value ? (value as ReadonlyArray<Suggestion>) : undefined);
  }

  return <MuiReactSelect label={label} placeholder={placeholder} suggestions={suggestions} value={value} onChange={handleChange} isMulti />;
};

export default MultiSelect;
