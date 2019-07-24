import React, { FC, useState } from 'react';
import { Theme, TableRow, TableCell, Table, TableHead, TableBody, TablePagination, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';
import Search from 'src/components/Search';
import Weekday from '@core/types/Weekday';

import TablePaginationActions from 'src/components/PaginationAction';

import Flight from 'src/view-models/flights/Flight';

const useStyles = makeStyles((theme: Theme) => ({
  searchWrapper: {
    margin: theme.spacing(0, 0, 5, 0)
  },
  tableCell: {
    paddingRight: theme.spacing(1)
  },
  divContent: {
    justifyContent: 'center',
    display: 'flex'
  },
  pagination: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(2.5)
  }
}));

export interface SearchFlightsSideBarProps {
  initialSearch?: string;
  flights: readonly Flight[];
  onClick(flight: Flight): void;
}

const SearchFlightsSideBar: FC<SearchFlightsSideBarProps> = ({ initialSearch, flights, onClick }) => {
  const [filteredFlights, setFilteredFlights] = useState<readonly Flight[]>(flights);
  const [pageNumber, setPageNumber] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(10);

  const classes = useStyles();

  function filterFlights(flights: readonly Flight[], query: readonly string[]) {
    setPageNumber(0);
    if (!query.length) return flights;
    return flights.filter(f => {
      const values = [f.label, f.arrivalAirport.name, f.departureAirport.name, f.flightNumber, f.aircraftRegister ? f.aircraftRegister.name : ''].map(s => s.toLowerCase());
      for (let j = 0; j < query.length; ++j) {
        if (values.some(s => s.includes(query[j]))) return true;
      }
      return false;
    });
  }

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
          {filteredFlights.slice(pageNumber * rowPerPage, (pageNumber + 1) * rowPerPage).map(f => {
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

      <TablePagination
        classes={{ root: classes.divContent }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        count={filteredFlights.length}
        onChangePage={(e, n) => {
          setPageNumber(n);
        }}
        page={pageNumber}
        rowsPerPage={rowPerPage}
        onChangeRowsPerPage={e => {
          setRowPerPage(+e.target.value);
          setPageNumber(0);
        }}
        ActionsComponent={TablePaginationActions}
      />
    </SideBarContainer>
  );
};

export default SearchFlightsSideBar;
