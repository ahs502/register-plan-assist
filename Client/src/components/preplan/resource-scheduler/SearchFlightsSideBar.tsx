import React, { FC, useState } from 'react';
import { Theme, TableRow, TableCell, Table, TableHead, TableBody } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';
import Search from 'src/components/Search';
import Weekday from '@core/types/Weekday';
import Flight from 'src/view-models/flight/Flight';

const useStyles = makeStyles((theme: Theme) => ({
  searchWrapper: {
    margin: theme.spacing(0, 0, 5, 0)
  },
  tableCell: {
    paddingRight: theme.spacing(1)
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
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell classes={{ root: classes.tableCell }}>Flight Number</TableCell>
            <TableCell classes={{ root: classes.tableCell }}>Route</TableCell>
            <TableCell classes={{ root: classes.tableCell }}>Weekday</TableCell>
            <TableCell classes={{ root: classes.tableCell }}>Register</TableCell>
            <TableCell classes={{ root: classes.tableCell }}>STD</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredFlights.map(f => {
            return (
              <TableRow key={f.derivedId} onClick={() => onClick(f)} hover={true}>
                <TableCell classes={{ root: classes.tableCell }}> {f.flightNumber}</TableCell>
                <TableCell classes={{ root: classes.tableCell }}>
                  {f.arrivalAirport.name} &ndash; {f.departureAirport.name}
                </TableCell>
                <TableCell classes={{ root: classes.tableCell }}>{Weekday[f.day].slice(0, 3)}</TableCell>
                <TableCell classes={{ root: classes.tableCell }}>{f.aircraftRegister ? f.aircraftRegister.name : '???'}</TableCell>
                <TableCell classes={{ root: classes.tableCell }}>{f.std.toString()}</TableCell>
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
