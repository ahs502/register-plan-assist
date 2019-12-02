import React, { FC } from 'react';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import DataType from 'src/utils/DataType';

export type RefiningTextFieldProps = TextFieldProps & {
  dataType: DataType<any, any>;
};

const RefiningTextField: FC<RefiningTextFieldProps> = ({ dataType, ...others }) => (
  <TextField
    {...others}
    onBlur={e => {
      const refinedValue = e.target.value && dataType.refineView(e.target.value);
      if (refinedValue === e.target.value) return;
      e.target.value = refinedValue;
      others.onChange && others.onChange(e);
    }}
  />
);

export default RefiningTextField;
