import React, { FC } from 'react';
import MuiReactSelect, { Suggestion } from './MuiReactSelect';

export interface AutoCompleteProps {
  label?: string;
  placeholder?: string;
  suggestions?: ReadonlyArray<Suggestion>;
  value?: Suggestion;
  onChange?: (value?: Suggestion) => void;
}

const AutoComplete: FC<AutoCompleteProps> = ({ label, placeholder, suggestions, value, onChange }) => (
  <MuiReactSelect label={label} placeholder={placeholder} suggestions={suggestions} value={value} onChange={() => onChange && onChange(value && (value as Suggestion))} />
);

export default AutoComplete;
