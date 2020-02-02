import React, { FC, useState, useEffect, Fragment, useContext, useMemo } from 'react';
import { Theme, Box, TableBody, TableRow, TableCell, Table, TableHead } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/styles';
import { PreplanContext } from 'src/pages/preplan';
import SelectWeeks, { WeekSelection } from 'src/components/preplan/SelectWeeks';
import { dataTypes } from 'src/utils/DataType';
import Week from 'src/business/Week';
import classNames from 'classnames';
import Weekday, { Weekdays } from '@core/types/Weekday';
import FlightPackView from 'src/business/flight/FlightPackView';

const useStyles = makeStyles((theme: Theme) => ({
  selectWeekWrapper: {
    margin: theme.spacing(0, 0, 1, 0),
    padding: 0
  },
  registerColumn: {
    width: 30,
    borderColor: theme.palette.grey[400],
    borderStyle: 'solid',
    borderWidth: 1,
    padding: theme.spacing(0.5),
    textAlign: 'center'
  },
  weekDayColumn: {
    textAlign: 'center'
  },
  borderTopThick: {
    borderTopColor: theme.palette.common.black,
    borderTopStyle: 'solid',
    borderTopWidth: 'thick'
  },
  borderBottom: {
    borderBottomColor: theme.palette.common.black,
    borderBottomStyle: 'solid',
    borderBottomWidth: 'thick'
  },
  border: {
    borderColor: theme.palette.grey[400],
    borderStyle: 'solid',
    borderWidth: 1,
    padding: theme.spacing(0.5)
  },
  flightPack: {
    textAlign: 'center'
  }
}));

export interface PreplanReportProps {}

interface ReportDateRangeState {
  startDate: string;
  endDate: string;
}

interface ReportState {
  [registerId: string]: {
    [weekDay: string]: FlightState[];
  };
}

interface FlightState {
  label: string;
  start: string;
  end: string;
  note: string | undefined;
}

// Component body:
const TimelineReport: FC<PreplanReportProps> = () => {
  // All state or reducer hooks:
  const preplan = useContext(PreplanContext);
  const [reportState, setReportState] = useState<ReportState>();

  const [weekSelection, setWeekSelection] = useState<WeekSelection>({
    previousStartIndex: 0,
    startIndex: 0,
    endIndex: preplan.weeks.all.length,
    nextEndIndex: preplan.weeks.all.length
  });

  const [reportDateRange, setReportDateRange] = useState<ReportDateRangeState>({
    startDate: dataTypes.utcDate.convertBusinessToView(preplan.startDate),
    endDate: dataTypes.utcDate.convertBusinessToView(preplan.endDate)
  });

  const flightPackViews = useMemo(
    () =>
      preplan.getFlightPackViews(
        new Week(dataTypes.utcDate.convertViewToBusiness(reportDateRange.startDate)),
        new Week(dataTypes.utcDate.convertViewToBusiness(reportDateRange.endDate))
      ),
    [reportDateRange]
  );

  const registers = useMemo(
    () => [
      ...preplan.aircraftRegisters.items
        .filter(r => r.options.status !== 'IGNORED')
        .sort((a, b) => {
          if (a.options.status === 'BACKUP' && b.options.status === 'INCLUDED') return 1;
          if (a.options.status === 'INCLUDED' && b.options.status === 'BACKUP') return -1;
          if (a.dummy && !b.dummy) return 1;
          if (!a.dummy && b.dummy) return -1;
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        }),
      { name: '???', id: '???' }
    ],
    [preplan]
  );

  useEffect(() => {
    const result = flightPackViews.groupBy(
      f => f.aircraftRegister?.id ?? '???',
      n =>
        n.groupBy<FlightState[]>(
          y => y.day.toString(),
          m => m.map<FlightState>(h => ({ label: h.label, start: h.startDateTime.format('t'), end: h.endDateTime.format('t'), note: h.notes }))
        )
    );

    setReportState(result);
  }, [flightPackViews]);

  // All third party hooks:
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Fragment>
      <Box display="block" displayPrint="none">
        <div className={classes.selectWeekWrapper}>
          <SelectWeeks
            includeSides={false}
            weekSelection={weekSelection}
            onSelectWeeks={weekSelection => {
              setWeekSelection(weekSelection);
              const weekStart = preplan.weeks.all[weekSelection.startIndex];
              const weekEnd = preplan.weeks.all[weekSelection.endIndex - 1];
              setReportDateRange({
                startDate: dataTypes.utcDate.convertBusinessToView(weekStart.startDate < preplan.startDate ? preplan.startDate : weekStart.startDate),
                endDate: dataTypes.utcDate.convertBusinessToView(weekEnd.endDate > preplan.endDate ? preplan.endDate : weekEnd.endDate)
              });
            }}
          />
        </div>
      </Box>
      <Box display="none" displayPrint="block">
        <div>{preplan.name}</div>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className={classes.registerColumn}></TableCell>
            <TableCell className={classNames(classes.border, classes.weekDayColumn)}>SAT</TableCell>
            <TableCell className={classNames(classes.border, classes.weekDayColumn)}>SAN</TableCell>
            <TableCell className={classNames(classes.border, classes.weekDayColumn)}>MON</TableCell>
            <TableCell className={classNames(classes.border, classes.weekDayColumn)}>TUE</TableCell>
            <TableCell className={classNames(classes.border, classes.weekDayColumn)}>WED</TableCell>
            <TableCell className={classNames(classes.border, classes.weekDayColumn)}>THU</TableCell>
            <TableCell className={classNames(classes.border, classes.weekDayColumn)}>FRI</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {registers.map((r, rIndex) => (
            <TableRow key={rIndex}>
              <TableCell className={classes.registerColumn}>{r.name}</TableCell>
              {Weekdays.map(d => (
                <TableCell className={classNames(classes.border, classes.flightPack)}>{reportState?.[r.id]?.[d.toString()]?.[0].label}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Fragment>
  );
};

// Default values of props when not provided by the user (only for optional props):

export default TimelineReport;
