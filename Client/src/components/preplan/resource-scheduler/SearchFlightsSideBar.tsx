import React, { FC, useState } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';
import { Flight } from 'src/view-models/FlightRequirement';
import { Search } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface SearchFlightsSideBarProps {
  initialSearch?: string;
  flights: readonly Flight[];
  onClick(flight: Flight): void;
}

const SearchFlightsSideBar: FC<SearchFlightsSideBarProps> = ({ initialSearch, flights, onClick }) => {
  const [filteredFlights, setFilteredFlights] = useState<readonly Flight[]>(flights);

  const classes = useStyles();

  return (
    <SideBarContainer label="Search Flights">
      <div>Flights...</div>
    </SideBarContainer>
  );
};

export default SearchFlightsSideBar;
