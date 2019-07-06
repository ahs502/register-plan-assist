import React, { FC, useState } from 'react';
import { Theme, TableHead, Tab, TableRow, TableCell, Table, TableBody } from '@material-ui/core';
import { ArrowForward as ArrowForwardIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';
import Search from 'src/components/Search';
import { Flight } from 'src/view-models/FlightRequirement';
import Weekday from '@core/types/Weekday';
import { ChangeLog } from 'src/view-models/AutoArrangerState';

const useStyles = makeStyles((theme: Theme) => ({
  searchWrapper: {
    margin: theme.spacing(0, 0, 5, 0)
  },
  flightCell: {
    width: 84
  },
  commonCell: {
    width: 48
  },
  tableCell: {
    paddingRight: theme.spacing(0.5),
    paddingLeft: theme.spacing(0.5)
  }
}));

export interface AutoArrangerChangeLogSideBarProps {
  initialSearch?: string;
  changeLogs: readonly ChangeLog[];
  onClick(flight: Flight): void;
}

const AutoArrangerChangeLogSideBar: FC<AutoArrangerChangeLogSideBarProps> = ({ initialSearch, changeLogs, onClick }) => {
  const [filteredChangeLogs, setfilteredChangeLogs] = useState(changeLogs);

  const classes = useStyles();

  return (
    <SideBarContainer label="Auto-Arranger Change Log">
      <div className={classes.searchWrapper}>
        <Search initialSearch={initialSearch} onQueryChange={query => setfilteredChangeLogs(filterChangeLogs(changeLogs, query))} />
      </div>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell classes={{ root: classes.tableCell }} rowSpan={2}>
              Flight
            </TableCell>
            <TableCell classes={{ root: classes.tableCell }} rowSpan={2}>
              Day
            </TableCell>
            <TableCell classes={{ root: classes.tableCell }} align="center" colSpan={2}>
              Old Flight
            </TableCell>
            <TableCell classes={{ root: classes.tableCell }} align="center" rowSpan={2} />
            <TableCell classes={{ root: classes.tableCell }} align="center" colSpan={2}>
              New Flight
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell classes={{ root: classes.tableCell }} align="center">
              Reg
            </TableCell>
            <TableCell classes={{ root: classes.tableCell }} align="center">
              STD
            </TableCell>
            <TableCell classes={{ root: classes.tableCell }} align="center">
              Reg
            </TableCell>
            <TableCell classes={{ root: classes.tableCell }} align="center">
              STD
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredChangeLogs.map(c => (
            <TableRow key={c.flight.derivedId} onClick={() => onClick(c.flight)} hover={true}>
              <TableCell classes={{ root: classes.tableCell }}>
                <div className={classes.flightCell}>
                  <div>{c.flight.flightNumber}</div>
                  {c.flight.departureAirport.name} &ndash; {c.flight.arrivalAirport.name}
                </div>
              </TableCell>
              <TableCell classes={{ root: classes.tableCell }}>
                <div className={classes.commonCell}>{Weekday[c.flight.day].slice(0, 3)}</div>
              </TableCell>
              <TableCell classes={{ root: classes.tableCell }} align="center">
                <div className={classes.commonCell}>{(c.oldAircraftRegister && c.oldAircraftRegister.name) || '???'}</div>
              </TableCell>
              <TableCell classes={{ root: classes.tableCell }} align="center">
                <div className={classes.commonCell}>{c.oldStd.toString()}</div>
              </TableCell>
              <TableCell classes={{ root: classes.tableCell }} align="center">
                <div className={classes.commonCell}>
                  <ArrowForwardIcon />
                </div>
              </TableCell>
              <TableCell classes={{ root: classes.tableCell }} align="center">
                <div className={classes.commonCell}>{(c.newAircraftRegister && c.newAircraftRegister.name) || '???'}</div>
              </TableCell>
              <TableCell classes={{ root: classes.tableCell }} align="center">
                <div className={classes.commonCell}>{c.newStd.toString()}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SideBarContainer>
  );
};
export default AutoArrangerChangeLogSideBar;

function filterChangeLogs(changeLogs: readonly ChangeLog[], query: readonly string[]) {
  if (!query.length) return changeLogs;
  return changeLogs.filter(c => {
    const values = [
      c.flight.flightNumber,
      c.flight.arrivalAirport.name,
      c.flight.departureAirport.name,
      c.newAircraftRegister ? c.newAircraftRegister.name : '',
      c.oldAircraftRegister ? c.oldAircraftRegister.name : ''
    ].map(s => s.toLowerCase());
    for (let j = 0; j < query.length; ++j) {
      if (values.some(s => s.includes(query[j]))) return true;
    }
    return false;
  });
}
