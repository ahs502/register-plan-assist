import React, { useState, PropsWithChildren, ReactElement } from 'react';
import { Theme, TextField } from '@material-ui/core';
import { BaseTextFieldProps } from '@material-ui/core/TextField';
import { makeStyles, useTheme } from '@material-ui/styles';
import { red } from '@material-ui/core/colors';

const useStyles = makeStyles((theme: Theme) => ({
  reject: {
    color: red[500]
  }
}));

export interface ItemPicker<T> extends BaseTextFieldProps {
  readonly sources: ReadonlyArray<Readonly<T>>;
  readonly fieldName: keyof T;
  onItemSelect?: (item: T) => void;
  defaultValue?: T;
}

const ItemPicker = <T extends {}>(props: PropsWithChildren<ItemPicker<T>>): ReactElement | null => {
  const { sources, fieldName, onItemSelect, defaultValue } = props;
  const selectItem = defaultValue ? defaultValue[fieldName] : '';
  const [selectedItem, setSelectedItem] = useState<string>((selectItem as any) as string);
  const [isValidObject, setIsValidObject] = useState(defaultValue ? sources.some(s => s[fieldName] === defaultValue[fieldName]) : false);

  const classes = useStyles();
  //const theme = useTheme();

  return (
    <TextField
      value={selectedItem}
      error={!isValidObject}
      InputProps={{
        className: !isValidObject ? classes.reject : ''
      }}
      onChange={e => {
        var itemValue = e.target.value;
        var item = sources.find(i => ((i[fieldName] as any) as string).toLowerCase() === itemValue.toLowerCase());

        if (item) {
          onItemSelect && onItemSelect(item);
          itemValue = itemValue.toUpperCase();
          setIsValidObject(true);
        } else {
          setIsValidObject(false);
        }
        setSelectedItem(itemValue);
      }}
    />
  );
};

export default ItemPicker;
