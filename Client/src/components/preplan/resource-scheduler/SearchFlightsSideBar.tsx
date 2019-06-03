import React, { FC } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface SearchFlightsSideBarProps {
  initialSearch?: string;
}

const SearchFlightsSideBar: FC<SearchFlightsSideBarProps> = ({ initialSearch }) => <SideBarContainer label="Search Flights">flights...</SideBarContainer>;

export default SearchFlightsSideBar;
