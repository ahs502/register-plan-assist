import React, { ReactElement } from 'react';
import { ActionMeta } from 'react-select/src/types';
import MuiReactSelect, { MuiReactSelectProps } from './MuiReactSelect';

export interface MultiSelectProps<T extends {}> extends MuiReactSelectProps<T> {
  onSelect?(value: readonly T[], action: ActionMeta): void;
}

const MultiSelect = <T extends {}>({ onSelect, onChange, ...others }: MultiSelectProps<T>): ReactElement | null => (
  <MuiReactSelect
    {...others}
    isMulti={true}
    onChange={(value, actionMeta) => {
      if (onSelect) return onSelect(value as readonly T[], actionMeta);
      if (onChange) return onChange(value, actionMeta);
    }}
  />
);

export default MultiSelect;
