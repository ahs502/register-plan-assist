import React, { FC } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface SelectAircraftRegistersSideBarProps {
  initialSearch?: string;
}

const SelectAircraftRegistersSideBar: FC<SelectAircraftRegistersSideBarProps> = ({ initialSearch }) => (
  <SideBarContainer label="Select Aircraft Registers">List of aircraft registers...</SideBarContainer>
);

export default SelectAircraftRegistersSideBar;
