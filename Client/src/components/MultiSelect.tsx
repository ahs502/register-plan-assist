import React, { FC } from 'react';
import MuiReactSelect, { Suggestion } from './MuiReactSelect';

export interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  suggestions?: ReadonlyArray<Suggestion>;
  value?: ReadonlyArray<Suggestion>;
  onChange?: (value?: ReadonlyArray<Suggestion>) => void;
}

const MultiSelect: FC<MultiSelectProps> = ({ label, placeholder, suggestions, value, onChange }) => (
  <MuiReactSelect
    label={label}
    placeholder={placeholder}
    suggestions={suggestions}
    value={value}
    onChange={() => onChange && onChange(value && (value as ReadonlyArray<Suggestion>))}
    isMulti
  />
);

export default MultiSelect;
