import React, { ReactElement } from 'react';
import MuiReactSelect, { MuiReactSelectProps } from './MuiReactSelect';

const MultiSelect = <T extends {}>({ ...others }: MuiReactSelectProps<T>): ReactElement | null => <MuiReactSelect isMulti {...others} />;

export default MultiSelect;
