import React, { ReactElement } from 'react';
import MuiReactSelect, { MuiReactSelectProps } from './MuiReactSelect';

const AutoComplete = <T extends {}>({ ...others }: MuiReactSelectProps<T>): ReactElement | null => <MuiReactSelect {...others} />;

export default AutoComplete;
