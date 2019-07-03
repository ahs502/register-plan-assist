import React, { FC, useState } from 'react';
import { Theme, TableHead, Tab, TableRow, TableCell, Table } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';
import Search from 'src/components/Search';
import { Flight } from 'src/view-models/FlightRequirement';
import AutoArrangerState from 'src/view-models/AutoArrangerState';

const useStyles = makeStyles((theme: Theme) => ({
  searchWrapper: {
    margin: theme.spacing(0, 0, 5, 0)
  }
}));

export interface AutoArrangerChangeLogSideBarProps {
  initialSearch?: string;
  flights: readonly Flight[];
  autoArrangerState: AutoArrangerState;
  onClick(flight: Flight): void;
}

const AutoArrangerChangeLogSideBar: FC<AutoArrangerChangeLogSideBarProps> = ({ initialSearch, flights }) => {
  const [filteredFlights, setFilteredFlights] = useState<readonly Flight[]>(flights);
  const [query, setQuery] = useState<readonly string[]>([]);
  const classes = useStyles();

  const filterFlights = (filteredFlights: readonly Flight[], query: readonly string[]) => {
    return filteredFlights.filter(f => {
      for (let j = 0; j < query.length; ++j) {
        if (((f.label || '') as string).toLowerCase().includes(query[j])) return true;
        if (((f.arrivalAirport.name || '') as string).toLowerCase().includes(query[j])) return true;
        if (((f.departureAirport.name || '') as string).toLowerCase().includes(query[j])) return true;
        if (((f.flightNumber || '') as string).toLowerCase().includes(query[j])) return true;
      }
    });
  };
  return (
    <SideBarContainer label="Auto-Arranger Change Log">
      <div className={classes.searchWrapper}>
        <Search
          onQueryChange={query => {
            setQuery(query);
            setFilteredFlights(filterFlights(filteredFlights, query));
          }}
        />
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Privious Flight Information</TableCell>
            <TableCell>New Flight Information</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>F.NO</TableCell>
            <TableCell>Day</TableCell>
            <TableCell>Route</TableCell>
            <TableCell>Reg</TableCell>
            <TableCell>STD</TableCell>
            <TableCell />
            <TableCell>Reg</TableCell>
            <TableCell>STD</TableCell>
          </TableRow>
        </TableHead>
      </Table>
    </SideBarContainer>
  );
};
export default AutoArrangerChangeLogSideBar;
