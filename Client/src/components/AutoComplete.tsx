import React, { ReactElement } from 'react';
import { ActionMeta } from 'react-select/src/types';
import MuiReactSelect, { MuiReactSelectProps } from './MuiReactSelect';

export interface AutoCompleteProps<T extends {}> extends MuiReactSelectProps<T> {
  onSelect?(value: T, action: ActionMeta): void;
}

const AutoComplete = <T extends {}>({ onSelect, onChange, ...others }: AutoCompleteProps<T>): ReactElement | null => (
  <MuiReactSelect
    {...others}
    onChange={(value, actionMeta) => {
      if (onSelect) return onSelect(value as T, actionMeta);
      if (onChange) return onChange(value, actionMeta);
    }}
  />
);

export default AutoComplete;
