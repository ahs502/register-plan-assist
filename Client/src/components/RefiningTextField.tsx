import React, { FC } from 'react';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import FormField from 'src/utils/FormField';

export type RefiningTextFieldProps = TextFieldProps & {
  formField: FormField;
};

const RefiningTextField: FC<RefiningTextFieldProps> = ({ formField, ...others }) => (
  <TextField
    {...others}
    onBlur={e => {
      const refinedValue = e.target.value && formField.refine(e.target.value);
      if (refinedValue === e.target.value) return;
      e.target.value = refinedValue;
      others.onChange && others.onChange(e);
    }}
  />
);

export default RefiningTextField;
