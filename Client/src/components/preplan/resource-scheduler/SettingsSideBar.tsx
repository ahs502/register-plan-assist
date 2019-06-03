import React, { FC } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface SettingsSideBarProps {}

const SettingsSideBar: FC<SettingsSideBarProps> = () => <SideBarContainer label="Auto-Arranger Options">options...</SideBarContainer>;

export default SettingsSideBar;
