import React, { FC, useState, useContext } from 'react';
import { Theme, TableRow, TableCell, Table, TableHead, TableBody, TablePagination } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Search from 'src/components/Search';
import Weekday from '@core/types/Weekday';
import TablePaginationActions from 'src/components/TablePaginationActions';
import FlightLeg from 'src/business/flight/FlightLeg';
import { PreplanContext } from 'src/pages/preplan';
import SideBarContainer from 'src/components/preplan/resource-scheduler/SideBarContainer';

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
  onClick(flightLeg: FlightLeg): void;
}

const SearchFlightsSideBar: FC<SearchFlightsSideBarProps> = ({ initialSearch, onClick }) => {
  const preplan = useContext(PreplanContext);

  const [filteredFlightLegs, setFilteredFlightLegs] = useState<readonly FlightLeg[]>(preplan.flightLegs);
  const [pageNumber, setPageNumber] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(10);

  const classes = useStyles();

  return (
    <SideBarContainer label="Search Flights">
      <div className={classes.searchWrapper}>
        <Search
          initialSearch={initialSearch}
          onQueryChange={query => {
            setPageNumber(0);
            setFilteredFlightLegs(
              !query.length
                ? preplan.flightLegs
                : preplan.flightLegs.filter(l => {
                    const values = [l.label, l.arrivalAirport.name, l.departureAirport.name, l.flightNumber.standardFormat, l.aircraftRegister ? l.aircraftRegister.name : ''].map(
                      s => s.toLowerCase()
                    );
                    for (let j = 0; j < query.length; ++j) {
                      if (values.some(s => s.includes(query[j]))) return true;
                    }
                    return false;
                  })
            );
          }}
        />
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
          {filteredFlightLegs.slice(pageNumber * rowPerPage, (pageNumber + 1) * rowPerPage).map(f => {
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
        rowsPerPageOptions={[10, 20, 50]}
        count={filteredFlightLegs.length}
        onChangePage={(event, page) => setPageNumber(page)}
        page={pageNumber}
        rowsPerPage={rowPerPage}
        onChangeRowsPerPage={event => {
          setRowPerPage(+event.target.value);
          setPageNumber(0);
        }}
        ActionsComponent={TablePaginationActions}
      />
    </SideBarContainer>
  );
};

export default SearchFlightsSideBar;
