import React, { FC, Fragment, useState } from 'react';
import { Theme, InputLabel, TextField, TableHead, TableCell, Table, TableRow, TableBody, Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Flight from 'src/view-models/flight/Flight';
import MasterData, { Airport } from '@core/master-data';
import FlightRequirement from 'src/view-models/flight/FlightRequirement';
import { ifStatement } from '@babel/types';
import { FiberManualRecord as BulletIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) => ({}));

const allAirports = MasterData.all.airports.items;
const ika = allAirports.find(a => a.name === 'IKA')!;
interface ProposalReportProps {
  flights: readonly FlightRequirement[];
  preplanName: string;
  fromDate: Date;
  toDate: Date;
}

const groupBy = <T extends {}>(
  list: T[],
  selector: string | ((item: T) => string | number),
  returnArray: boolean | undefined,
  converter: ((item: T) => any) | undefined
): { [index: string]: T[]; [index: number]: T[] } => {
  if (list.length === 0) return {};

  var groupedObj: { [index: string]: T[]; [index: number]: T[] } = {};

  selector = selector || ((item: any) => item);

  if (typeof selector === 'string') {
    var prop = selector;
    selector = (item: any) => item[prop];
  }

  if (typeof selector !== 'function') return {};

  list.forEach(item => {
    if (typeof selector !== 'function') return;
    var value = selector(item);
    if (!value) return;
    if (!groupedObj[value]) {
      groupedObj[value] = [];
    }
    groupedObj[value].push(typeof converter === 'function' ? converter(item) : item);
  });

  return groupedObj;

  // if (!returnArray) return groupedObj;

  // const result = Object.keys(groupedObj).map(function(k) {
  //   if (groupedObj.hasOwnProperty(k)) {
  //     return groupedObj[k];
  //   }
  // });

  // return result || T[];
};

const ProposalReport: FC<ProposalReportProps> = ({ flights, preplanName, fromDate, toDate }) => {
  const [baseAirport, setBaseAirport] = useState<Airport>(ika);
  //const [filterFlight, setFilterFlight] = useState();

  const classes = useStyles();

  const filterFlights = flights.filter(f => {
    return baseAirport ? f.definition.departureAirport.id === baseAirport.id || f.definition.arrivalAirport.id === baseAirport.id : true;
    //return  !baseAirport || (f.definition.departureAirport.id === baseAirport.id || f.definition.arrivalAirport.id === baseAirport.id) ;
  });

  const groupFlights = groupBy(
    filterFlights,
    f => {
      if (f.definition.arrivalAirport.id === baseAirport.id) return f.definition.departureAirport.name;
      if (f.definition.departureAirport.id === baseAirport.id) return f.definition.arrivalAirport.name;
      return '';
    },
    false,
    undefined
  );

  return (
    <Fragment>
      <Typography variant="caption">
        Proposal Schedule from {fromDate.toDateString()} till {toDate.toDateString()}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={15}>
              {baseAirport ? 'Base ' + baseAirport.name : 'All Base'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell rowSpan={2}>F/N</TableCell>
            <TableCell rowSpan={2}>ROUTE</TableCell>
            <TableCell align="center" colSpan={2} rowSpan={2}>
              LCL
            </TableCell>
            <TableCell align="center" colSpan={2} rowSpan={2}>
              UTC
            </TableCell>
            <TableCell>
              <div>Sat</div>
              <div>6</div>
            </TableCell>
            <TableCell>
              <div>Sun</div>
              <div>7</div>
            </TableCell>
            <TableCell>
              <div>Mon</div>
              <div>1</div>
            </TableCell>
            <TableCell>
              <div>Tue</div>
              <div>2</div>
            </TableCell>
            <TableCell>
              <div>Wed</div>
              <div>3</div>
            </TableCell>
            <TableCell>
              <div>Thu</div>
              <div>4</div>
            </TableCell>
            <TableCell>
              <div>Fri</div>
              <div>5</div>
            </TableCell>
            <TableCell>DUR.</TableCell>
            <TableCell>
              <div>NOTE</div>
              <div>(base on domestic/lcl)</div>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allAirports.map(airport => {
            const flightRequirements = groupFlights[airport.name];
            if (!flightRequirements) return;

            return flightRequirements.map(f => (
              <TableRow key={f.id}>
                <TableCell>{f.definition.flightNumber}</TableCell>
                <TableCell>
                  {f.definition.departureAirport.name}&ndash;{f.definition.arrivalAirport.name}
                </TableCell>
                <TableCell>LCL Dep</TableCell>
                <TableCell>LCL Arr</TableCell>
                <TableCell>UTC Dep</TableCell>
                <TableCell>UTC Arr</TableCell>
                <TableCell>
                  <BulletIcon />
                </TableCell>
                <TableCell>
                  <BulletIcon />
                </TableCell>
                <TableCell>
                  <BulletIcon />
                </TableCell>
                <TableCell>
                  <BulletIcon />
                </TableCell>
                <TableCell>
                  <BulletIcon />
                </TableCell>
                <TableCell>
                  <BulletIcon />
                </TableCell>
                <TableCell>
                  <BulletIcon />
                </TableCell>
                <TableCell>{f.scope.blockTime}</TableCell>
                <TableCell />
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </Fragment>
  );
};

export default ProposalReport;
