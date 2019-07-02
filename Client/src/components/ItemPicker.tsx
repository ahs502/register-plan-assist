import React, { useState, PropsWithChildren, ReactElement } from 'react';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';

export type ItemPickerProps<K extends string, T extends { [key in K]: string }> = Omit<TextFieldProps, 'value' | 'onChange'> & {
  items: readonly T[];
  fieldName: K;
  onChange?: (item: T | undefined, value: string) => void;
  item: T | undefined;
};

const ItemPicker = <K extends string, T extends { [key in K]: string }>({
  items,
  fieldName,
  onChange,
  item,
  ...others
}: PropsWithChildren<ItemPickerProps<K, T>>): ReactElement | null => {
  const [value, setValue] = useState(() => (item ? (item[fieldName] as string) : ''));

  return (
    <TextField
      {...others as any}
      value={value}
      onChange={e => {
        const value = e.target.value;
        const itemValue = (value || '').toUpperCase();
        const item = items.find(i => i[fieldName].toUpperCase() === itemValue);
        onChange && onChange(item, value);
        setValue(item ? itemValue : value);
      }}
    />
  );
};

export default ItemPicker;
