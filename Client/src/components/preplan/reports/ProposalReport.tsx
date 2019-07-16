import React, { FC, Fragment, useState, useEffect } from 'react';
import { Theme, InputLabel, TextField, TableHead, TableCell, Table, TableRow, TableBody, Button, Typography, Select } from '@material-ui/core';
import { red } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/styles';
import MasterData, { Airport } from '@core/master-data';
import FlightRequirement from 'src/view-models/flight/FlightRequirement';
import { FiberManualRecord as BulletIcon } from '@material-ui/icons';
import Daytime from '@core/types/Daytime';
import classNames from 'classnames';
import { start } from 'repl';

const useStyles = makeStyles((theme: Theme) => ({
  marginBottom1: {
    marginBottom: theme.spacing(1)
  },
  marginBottom2: {
    marginBottom: theme.spacing(2)
  },
  marginRight1: {
    marginRight: theme.spacing(1)
  },
  borderTop: {
    borderTopColor: theme.palette.common.black,
    borderTopStyle: 'solid',
    borderTopWidth: 'thick'
  },
  borderBottom: {
    borderBottomColor: theme.palette.common.black,
    borderBottomStyle: 'solid',
    borderBottomWidth: 'thick'
  },
  boarder: {
    borderColor: theme.palette.grey[400],
    borderStyle: 'solid',
    borderWidth: 1
  },
  bullet: {
    position: 'relative',
    top: 5,
    left: 10
  },
  utc: {
    color: red[500]
  },
  diffFont: {
    bottom: 4,
    position: 'relative',
    fontSize: 20
  },
  diffContainer: {
    position: 'relative',
    bottom: 3
  }
}));

const allAirports = MasterData.all.airports.items.orderBy(a => a.name);
const ika = allAirports.find(a => a.name === 'IKA')!;
const thr = allAirports.find(a => a.name === 'THR')!;
const mhd = allAirports.find(a => a.name === 'MHD')!;
const ker = allAirports.find(a => a.name === 'KER')!;
const allBaseAirport = [ika, thr, mhd, ker];

enum FlightType {
  'Domestic',
  'International'
}

interface ProposalReportProps {
  flightRequirments: readonly FlightRequirement[];
  preplanName: string;
  fromDate: Date;
  toDate: Date;
}

interface ReportModel {
  label: string;
  destinationAirport: Airport;
  flightRequirments: FlightRequirement[];
  flattenFlightRequirments: FlattenFlightRequirment[];
}

interface FlattenFlightRequirment {
  flightNumber: string;
  departureAirport: Airport;
  arrivalAirport: Airport;
  std: Daytime;
  blocktime: number;
  days: number[];
  note: string;
  localStd: string;
  localSta: string;
  utcStd: string;
  utcSta: string;
  diffLocalStdandUtcStd: number;
  diffLocalStdandLocalSta: number;
  diffLocalStdandUtcSta: number;
}

const normalizeFlightNumber = (flightNumber: string): string => {
  if (flightNumber && flightNumber.toUpperCase().startsWith('W5')) return flightNumber.substring(2).trim();
  return flightNumber;
};

const formatMinuteToString = (minutes: number): string => {
  if (!minutes) return '';
  return (
    Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0') +
    ':' +
    (minutes % 60).toString().padStart(2, '0')
  );
};

const formatDateToString = (date: Date): string => {
  if (!date) return '';
  return (
    date
      .getUTCHours()
      .toString()
      .padStart(2, '0') +
    date
      .getUTCMinutes()
      .toString()
      .padStart(2, '0')
  );
};

const compareFunction = (a: number, b: number): number => {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
};

const groupBy = <T extends {}>(
  list: readonly T[],
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

const ProposalReport: FC<ProposalReportProps> = ({ flightRequirments: flightRequirments, preplanName, fromDate, toDate }) => {
  const [baseAirport, setBaseAirport] = useState<Airport>(ika);
  const [startDate, setStartDate] = useState<Date>(new Date(Date.parse('2019-07-06')));
  const [endDate, setEndDate] = useState<Date>(new Date(Date.parse('2019-07-14')));
  const [flightType, setFlightType] = useState<FlightType>(FlightType.International);
  const [reportModels, setReportModels] = useState<ReportModel[]>([]);

  const classes = useStyles();

  const generateReportDataModel = (): ReportModel[] => {
    if (!baseAirport || !startDate || !endDate || startDate < fromDate || startDate > toDate || endDate < fromDate || endDate > toDate) return [];

    const reportModels = flightRequirments
      .filter(f => {
        return (
          (f.definition.departureAirport.id === baseAirport.id || f.definition.arrivalAirport.id === baseAirport.id) &&
          ((f.definition.departureAirport.id === baseAirport.id && f.definition.arrivalAirport.international === (flightType === FlightType.International)) ||
            (f.definition.arrivalAirport.id === baseAirport.id && f.definition.departureAirport.international === (flightType === FlightType.International)))
        );
      })
      .map(f => ({ label: f.definition.label } as ReportModel))
      .reduce(
        (acc, current) => {
          !acc.some(l => l.label === current.label) && acc.push(current);
          return acc;
        },
        [] as ReportModel[]
      )
      .sortBy('label');

    const baseDate = new Date(new Date((startDate.getTime() + endDate.getTime()) / 2));

    reportModels.forEach(m => {
      m.flightRequirments = flightRequirments.filter(f => f.definition.label === m.label);

      const flattenFlightRequirments = m.flightRequirments
        .map(f => {
          return f.days.map(d => ({
            flightNumber: f.definition.flightNumber,
            arrivalAirport: f.definition.arrivalAirport,
            departureAirport: f.definition.departureAirport,
            blocktime: d.scope.blockTime,
            day: d.day,
            std: d.flight.std,
            note: d.scope.slotComment
          }));
        })
        .flat();

      const flattenFlightRequirmentList = flattenFlightRequirments.reduce(
        (acc, current) => {
          const existFlatten = acc.find(
            f =>
              f.arrivalAirport.id === current.arrivalAirport.id &&
              f.departureAirport.id === current.departureAirport.id &&
              f.blocktime === current.blocktime &&
              f.flightNumber === current.flightNumber &&
              f.std.minutes === current.std.minutes
          );
          if (existFlatten) {
            const weekDay = (current.day + existFlatten.diffLocalStdandUtcStd + 7) % 7;
            existFlatten.days.indexOf(weekDay) === -1 && existFlatten.days.push(weekDay);
          } else {
            const utcStd = current.std.toDate(baseDate);
            const localStd = current.departureAirport.convertUtcToLocal(utcStd);
            const utcSta = current.std.toDate(baseDate);
            utcSta.addMinutes(current.blocktime);
            const localSta = current.arrivalAirport.convertUtcToLocal(utcSta);

            const diffLocalStdandUtcStd = localStd.getUTCDay() - utcStd.getUTCDay();
            const diffLocalStdandUtcSta = localStd.getUTCDay() - utcSta.getUTCDay();
            const diffLocalStdandLocalSta = localStd.getUTCDay() - localSta.getUTCDay();

            const weekDay = (current.day + diffLocalStdandUtcStd + 7) % 7;

            acc.push({
              flightNumber: current.flightNumber,
              arrivalAirport: current.arrivalAirport,
              departureAirport: current.departureAirport,
              blocktime: current.blocktime,
              days: [weekDay],
              std: current.std,
              note: current.note,
              localStd: formatDateToString(localStd),
              localSta: formatDateToString(localSta),
              utcStd: formatDateToString(utcStd),
              utcSta: formatDateToString(utcSta),
              diffLocalStdandUtcStd: diffLocalStdandUtcStd,
              diffLocalStdandLocalSta: diffLocalStdandLocalSta,
              diffLocalStdandUtcSta: diffLocalStdandUtcSta
            } as FlattenFlightRequirment);
          }

          return acc;
        },
        [] as FlattenFlightRequirment[]
      );

      flattenFlightRequirmentList.sort((a, b) => compareFunction(a.std.minutes, b.std.minutes));
      let previousAirport = baseAirport;
      m.flattenFlightRequirments = [] as FlattenFlightRequirment[];
      let previousFlights = flattenFlightRequirmentList.filter(f => f.departureAirport.id === previousAirport.id);

      if (previousFlights && previousFlights.length > 0) {
        m.flattenFlightRequirments = m.flattenFlightRequirments.concat(previousFlights);
        m.flattenFlightRequirments.forEach(f => flattenFlightRequirmentList.remove(f));

        while (flattenFlightRequirmentList.length > 0) {
          previousAirport = previousFlights[0].arrivalAirport;
          let nextFlight = flattenFlightRequirmentList.filter(f => f.departureAirport.id === previousAirport.id);
          if (nextFlight && nextFlight.length > 0) {
            previousFlights = [...nextFlight];
            m.flattenFlightRequirments = m.flattenFlightRequirments.concat(previousFlights);
            m.flattenFlightRequirments.forEach(f => flattenFlightRequirmentList.remove(f));
          } else {
            m.flattenFlightRequirments = m.flattenFlightRequirments.concat([...flattenFlightRequirmentList]);
            break;
          }
        }
      } else {
        m.flattenFlightRequirments = m.flattenFlightRequirments.concat([...flattenFlightRequirmentList]);
      }
    });

    //setReportModels(reportModels);
    return reportModels;
  };

  useEffect(() => {
    setReportModels(generateReportDataModel());
  }, [baseAirport, startDate, endDate, flightType]);

  return (
    <Fragment>
      <InputLabel htmlFor="base-airport" className={classes.marginBottom1}>
        Base Airport
      </InputLabel>
      <select
        id="base-airport"
        onChange={event => {
          setBaseAirport(allBaseAirport[+event.target.value]);
        }}
        className={classes.marginBottom1}
      >
        {allBaseAirport.map((option, index) => (
          <option key={index} value={index}>
            {option.name}
          </option>
        ))}
      </select>

      <InputLabel htmlFor="flight-type" className={classes.marginBottom1}>
        Flight Type
      </InputLabel>
      <select
        id="flight-type"
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
          setFlightType(event.target.value === 'Domestic' ? FlightType.Domestic : FlightType.International);
        }}
        className={classes.marginBottom1}
      >
        <option value="International">International</option>
        <option value="Domestic">Domestic</option>
      </select>
      <br />
      <TextField
        className={classNames(classes.marginRight1, classes.marginBottom2)}
        label=" Start Date"
        onChange={e => {
          const value = e.target.value;
          if (!value) return;
          const ticks = Date.parse(value);
          if (ticks) setStartDate(new Date(ticks));
        }}
      />

      <TextField
        className={classNames(classes.marginRight1, classes.marginBottom2)}
        label="End Date"
        onChange={e => {
          const value = e.target.value;
          if (!value) return;
          const ticks = Date.parse(value);
          if (ticks) setEndDate(new Date(ticks));
        }}
      />

      <Table className={classNames(classes.marginBottom1, classes.marginRight1)}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.boarder} align="center" colSpan={15}>
              {baseAirport ? 'Base ' + baseAirport.name : ''}
            </TableCell>
          </TableRow>
          <TableRow className={classes.borderBottom}>
            <TableCell className={classes.boarder} rowSpan={2}>
              F/N
            </TableCell>
            <TableCell className={classes.boarder} rowSpan={2}>
              ROUTE
            </TableCell>
            <TableCell className={classes.boarder} align="center" colSpan={2} rowSpan={2}>
              LCL
            </TableCell>
            <TableCell className={classNames(classes.boarder, classes.utc)} align="center" colSpan={2} rowSpan={2}>
              UTC
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>Sat</div>
              <div>6</div>
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>Sun</div>
              <div>7</div>
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>Mon</div>
              <div>1</div>
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>Tue</div>
              <div>2</div>
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>Wed</div>
              <div>3</div>
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>Thu</div>
              <div>4</div>
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>Fri</div>
              <div>5</div>
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              DUR.
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>NOTE</div>
              <div>(base on domestic/lcl)</div>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportModels.map(rm => {
            const flattenFlightRequirment = rm.flattenFlightRequirments;
            if (!flattenFlightRequirment) return;

            return flattenFlightRequirment.map((f, index) => (
              <TableRow key={index.toString() + f.flightNumber} className={index === 0 ? classes.borderTop : undefined}>
                <TableCell className={classes.boarder}>{normalizeFlightNumber(f.flightNumber)}</TableCell>
                <TableCell className={classes.boarder}>
                  {f.departureAirport.name}&ndash;{f.arrivalAirport.name}
                </TableCell>
                <TableCell className={classes.boarder} align="center">
                  {f.localStd}
                </TableCell>
                <TableCell className={classes.boarder} align="center">
                  <div className={f.diffLocalStdandLocalSta < 0 ? classes.diffContainer : ''}>
                    <span>{f.localSta}</span>
                    <span className={f.diffLocalStdandLocalSta < 0 ? classes.diffFont : ''}>
                      {f.diffLocalStdandLocalSta < 0 ? '\u204E' : f.diffLocalStdandLocalSta > 0 ? '#' : ''}
                    </span>
                  </div>
                </TableCell>
                <TableCell className={classNames(classes.boarder, classes.utc)} align="center">
                  <div className={f.diffLocalStdandLocalSta < 0 ? classes.diffContainer : ''}>
                    <span>{f.utcStd}</span>
                    <span className={f.diffLocalStdandUtcStd < 0 ? classes.diffFont : ''}>{f.diffLocalStdandUtcStd < 0 ? '\u204E' : f.diffLocalStdandUtcStd > 0 ? '#' : ''}</span>
                  </div>
                </TableCell>
                <TableCell className={classNames(classes.boarder, classes.utc)} align="center">
                  <div className={f.diffLocalStdandLocalSta < 0 ? classes.diffContainer : ''}>
                    <span>{f.utcSta}</span>
                    <span className={f.diffLocalStdandUtcSta < 0 ? classes.diffFont : ''}>{f.diffLocalStdandUtcSta < 0 ? '\u204E' : f.diffLocalStdandUtcSta > 0 ? '#' : ''}</span>
                  </div>
                </TableCell>
                <TableCell align="center" className={classes.boarder}>
                  {f.days.indexOf(0) !== -1 ? <BulletIcon className={classes.bullet} /> : undefined}
                </TableCell>
                <TableCell align="center" className={classes.boarder}>
                  {f.days.indexOf(1) !== -1 ? <BulletIcon className={classes.bullet} /> : undefined}
                </TableCell>
                <TableCell align="center" className={classes.boarder}>
                  {f.days.indexOf(2) !== -1 ? <BulletIcon className={classes.bullet} /> : undefined}
                </TableCell>
                <TableCell align="center" className={classes.boarder}>
                  {f.days.indexOf(3) !== -1 ? <BulletIcon className={classes.bullet} /> : undefined}
                </TableCell>
                <TableCell align="center" className={classes.boarder}>
                  {f.days.indexOf(4) !== -1 ? <BulletIcon className={classes.bullet} /> : undefined}
                </TableCell>
                <TableCell align="center" className={classes.boarder}>
                  {f.days.indexOf(5) !== -1 ? <BulletIcon className={classes.bullet} /> : undefined}
                </TableCell>
                <TableCell align="center" className={classes.boarder}>
                  {f.days.indexOf(6) !== -1 ? <BulletIcon className={classes.bullet} /> : undefined}
                </TableCell>
                <TableCell align="center" className={classes.boarder}>
                  {formatMinuteToString(f.blocktime)}
                </TableCell>
                <TableCell align="center" className={classes.boarder}>
                  {f.note}
                </TableCell>
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </Fragment>
  );
};

export default ProposalReport;
