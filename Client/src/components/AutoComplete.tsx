import React, { FunctionComponent } from 'react';
import MuiReactSelect, { Suggestion } from './MuiReactSelect';
import { ValueType } from 'react-select/lib/types';

export interface AutoCompleteProps {
  label?: string;
  placeholder?: string;
  suggestions?: ReadonlyArray<Suggestion>;
  value?: Suggestion;
  onChange?: (value?: Suggestion) => void;
}

const AutoComplete: FunctionComponent<AutoCompleteProps> = ({ label, placeholder, suggestions, value, onChange }: AutoCompleteProps) => {
  function handleChange(value: ValueType<Suggestion>) {
    if (typeof onChange !== 'function') return;
    onChange(value ? (value as Suggestion) : undefined);
  }

  return <MuiReactSelect label={label} placeholder={placeholder} suggestions={suggestions} value={value} onChange={handleChange} />;
};

export default AutoComplete;
