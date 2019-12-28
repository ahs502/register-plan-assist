import React, { FC } from 'react';
import Preplan from 'src/business/preplan/Preplan';

export interface SelectWeekProps {
  preplan: Preplan;
}

const SelectWeek: FC<SelectWeekProps> = ({ preplan }) => {
  return <div>Select Week Component</div>;
};

export default SelectWeek;
