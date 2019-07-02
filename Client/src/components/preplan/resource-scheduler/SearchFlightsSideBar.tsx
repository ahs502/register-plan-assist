import React, { FC, useState } from 'react';
import { Theme, TableRow, TableCell, Table, TableHead, TableBody } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';
import { Flight } from 'src/view-models/FlightRequirement';
import Search, { filterOnProperties } from 'src/components/Search';
import Weekday from '@core/types/Weekday';

const useStyles = makeStyles((theme: Theme) => ({
  searchWrapper: {
    margin: theme.spacing(0, 0, 5, 0)
  }
}));

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
      <div className={classes.searchWrapper}>
        <Search initialSearch={initialSearch} onQueryChange={query => setFilteredFlights(filterFlights(flights, query))} />
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>F.NO</TableCell>
            <TableCell>DEP-ARR</TableCell>
            <TableCell>Register</TableCell>
            <TableCell>Weekday</TableCell>
            <TableCell>STD</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredFlights.map(f => {
            return (
              <TableRow key={f.derivedId} onClick={() => onClick(f)}>
                <TableCell> {f.flightNumber}</TableCell>
                <TableCell>{f.arrivalAirport.name + '-' + f.departureAirport.name}</TableCell>
                <TableCell>{f.aircraftRegister ? f.aircraftRegister.name : '???'}</TableCell>
                <TableCell>{Weekday[f.day]}</TableCell>
                <TableCell>{f.std.toString()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </SideBarContainer>
  );
};

export default SearchFlightsSideBar;

function filterFlights(flights: readonly Flight[], query: readonly string[]) {
  if (!query.length) return flights;
  return flights.filter(f => {
    const values = [f.label, f.arrivalAirport.name, f.departureAirport.name, f.flightNumber, f.aircraftRegister ? f.aircraftRegister.name : ''].map(s => s.toLowerCase());
    for (let j = 0; j < query.length; ++j) {
      if (values.some(s => s.includes(query[j]))) return true;
    }
    return false;
  });
}
