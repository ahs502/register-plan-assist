import React, { FC } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface AutoArrangerChangeLogSideBarProps {
  initialSearch?: string;
}

const AutoArrangerChangeLogSideBar: FC<AutoArrangerChangeLogSideBarProps> = ({ initialSearch }) => <SideBarContainer label="Auto-Arranger Change Log">logs...</SideBarContainer>;

export default AutoArrangerChangeLogSideBar;
