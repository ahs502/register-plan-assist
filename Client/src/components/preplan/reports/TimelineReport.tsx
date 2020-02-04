import React, { FC, useState, useEffect, Fragment, useContext, useMemo, CSSProperties } from 'react';
import { Theme, Box, TableBody, TableRow, TableCell, Table, TableHead } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/styles';
import { PreplanContext } from 'src/pages/preplan';
import SelectWeeks, { WeekSelection } from 'src/components/preplan/SelectWeeks';
import { dataTypes } from 'src/utils/DataType';
import Week from 'src/business/Week';
import classNames from 'classnames';
import Weekday, { Weekdays } from '@core/types/Weekday';
import chroma from 'chroma-js';
import { Stc } from 'src/business/master-data';
import persistant from 'src/utils/persistant';
import Daytime from '@core/types/Daytime';

const useStyles = makeStyles((theme: Theme) => ({
  selectWeekWrapper: {
    margin: theme.spacing(0, 0, 1, 0),
    padding: 0
  },
  registerColumnHeader: {
    textAlign: 'center',
    display: 'flex'
  },
  registerColumnBody: {
    width: 40,
    borderColor: theme.palette.grey[400],
    borderStyle: 'solid',
    borderWidth: 1,
    padding: 2,
    textAlign: 'center'
  },
  weekDayColumnHeader: {
    textAlign: 'center',
    padding: 0
  },
  saturdayColumnHeader: {
    flexGrow: 1,
    textAlign: 'left',
    paddingLeft: 2
  },
  fridayColumn: {
    paddingRight: '1px !important'
  },
  borderTopThick: {
    borderTopColor: theme.palette.common.black,
    borderTopStyle: 'solid',
    borderTopWidth: 'medium'
  },
  borderBottom: {
    borderBottomColor: theme.palette.common.black,
    borderBottomStyle: 'solid',
    borderBottomWidth: 'thick'
  },
  border: {
    borderColor: theme.palette.grey[400],
    borderStyle: 'solid',
    borderWidth: 1
  },
  weekDayColumnBody: {
    textAlign: 'center',
    padding: 0.75
  },
  dayContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  flightContainer: {
    flexGrow: 1
  },
  timeContainer: {
    display: 'flex',
    marginBottom: -7
  },
  time: {
    flexGrow: 1,
    fontSize: '9px'
  },
  timeDeparture: {
    marginRight: 2
  },
  timeArrival: {
    marginLeft: 2
  },
  label: {
    fontSize: '11px',
    fontWeight: 'bold'
  },
  note: {
    fontSize: '9px',
    marginTop: -4
  },
  plusSeperator: {
    flexGrow: 1
  },
  preplanNameContainer: {
    display: 'flex'
  },
  preplanName: {
    flexGrow: 1,
    paddingLeft: 2,
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    borderRightStyle: 'solid',
    borderRightWidth: 1,
    borderRightColor: theme.palette.grey[400]
  },
  beforeNoonFlight: {
    paddingRight: '50%'
  },
  afterNoonFlight: {
    paddingLeft: '50%'
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
  flightDurationPerDay: number;
  departuerFromIka: string;
  arrivalToIka: string;
  note: string | undefined;
  stc: string;
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

  const flightViews = useMemo(
    () =>
      preplan.getFlightViews(
        new Week(dataTypes.utcDate.convertViewToBusiness(reportDateRange.startDate)),
        new Week(dataTypes.utcDate.convertViewToBusiness(reportDateRange.endDate))
      ),
    [reportDateRange]
  );

  const registers = useMemo(
    () =>
      preplan.aircraftRegisters.items
        .filter(r => r.options.status !== 'IGNORED')
        .sort((a, b) => {
          if (a.aircraftType.displayOrder > b.aircraftType.displayOrder) return 1;
          if (a.aircraftType.displayOrder < b.aircraftType.displayOrder) return -1;
          if (a.options.status === 'BACKUP' && b.options.status === 'INCLUDED') return 1;
          if (a.options.status === 'INCLUDED' && b.options.status === 'BACKUP') return -1;
          if (a.dummy && !b.dummy) return 1;
          if (!a.dummy && b.dummy) return -1;
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        }),
    [preplan]
  );

  useEffect(() => {
    const result = flightViews
      .filter(n => n.rsx === 'REAL' || n.rsx === 'STB1')
      .groupBy(
        f => f.aircraftRegister?.id ?? '???',
        n => {
          const groupByDay = n.groupBy<FlightState[]>(
            y => ((y.legs[0].departureAirport.convertUtcToLocal(y.startDateTime).getUTCDay() + 1) % 7).toString(),
            m => {
              return m
                .map<FlightState>(h => {
                  const firstLegDeparture = h.legs[0].departureAirport.convertUtcToLocal(h.startDateTime);
                  const lastLegArrival = h.legs[h.legs.length - 1].arrivalAirport.convertUtcToLocal(h.endDateTime);
                  const firstLegDepartureDate = new Date(firstLegDeparture);
                  const lastLegArrivalDate = new Date(lastLegArrival);
                  firstLegDepartureDate.setUTCHours(0, 0, 0);
                  lastLegArrivalDate.setUTCHours(0, 0, 0);

                  return {
                    label: h.label,
                    flightDurationPerDay: (lastLegArrivalDate.getTime() - firstLegDepartureDate.getTime()) / (1000 * 60 * 60 * 24) + 1,
                    departuerFromIka: firstLegDeparture.format('t#'),
                    arrivalToIka: lastLegArrival.format('t#'),
                    note: h.notes,
                    stc: h.stc.name
                  };
                })
                .sortBy('departuerFromIka');
            }
          );

          for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const flightStates = groupByDay[dayIndex.toString()];
            if (flightStates) {
              for (let flightStatesIndex = 0; flightStatesIndex < flightStates.length; flightStatesIndex++) {
                const flightState = flightStates[flightStatesIndex];
                const flightDuration = flightState.flightDurationPerDay;
                if (flightDuration > 1) {
                  for (let index = 1; index < flightDuration; index++) {
                    let additionalDay = dayIndex + index;
                    additionalDay > 6 && (additionalDay = additionalDay % 7);
                    const extraFlightState: FlightState = {
                      ...flightState,
                      flightDurationPerDay: 0,
                      departuerFromIka: '',
                      arrivalToIka: index + 1 === flightDuration ? flightState.arrivalToIka : '',
                      note: index === 1 && flightDuration > 2 ? flightState.note : undefined
                    };
                    groupByDay[additionalDay] = groupByDay[additionalDay] || [];
                    groupByDay[additionalDay].unshift(extraFlightState);
                  }
                  flightState.arrivalToIka = '';
                  flightDuration > 2 && (flightState.note = undefined);
                }
              }
            }
          }

          return groupByDay;
        }
      );

    setReportState(result);
  }, [flightViews]);

  // All third party hooks:
  const classes = useStyles();
  const theme = useTheme();

  return (
    <div>
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

      <Box display="block" displayPrint="block">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell colSpan={2} className={classNames(classes.border, classes.weekDayColumnHeader)}>
                <div className={classes.preplanNameContainer}>
                  <span className={classes.preplanName}>{preplan.name}</span>
                  <div className={classes.saturdayColumnHeader}>SAT</div>
                </div>
              </TableCell>
              {/* <TableCell className={classNames(classes.weekDayColumnHeader, classes.saturdayColumnHeader)}>SAT</TableCell> */}
              <TableCell className={classNames(classes.border, classes.weekDayColumnHeader)}>SAN</TableCell>
              <TableCell className={classNames(classes.border, classes.weekDayColumnHeader)}>MON</TableCell>
              <TableCell className={classNames(classes.border, classes.weekDayColumnHeader)}>TUE</TableCell>
              <TableCell className={classNames(classes.border, classes.weekDayColumnHeader)}>WED</TableCell>
              <TableCell className={classNames(classes.border, classes.weekDayColumnHeader)}>THU</TableCell>
              <TableCell className={classNames(classes.border, classes.weekDayColumnHeader, classes.fridayColumn)}>FRI</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registers.map((r, rIndex, self) => (
              <TableRow key={rIndex} className={classNames({ [classes.borderTopThick]: rIndex > 0 && r.aircraftType !== self[rIndex - 1].aircraftType })}>
                <TableCell className={classes.registerColumnBody}>{r.name}</TableCell>
                {Weekdays.map(d => (
                  <TableCell className={classNames(classes.border, classes.weekDayColumnBody, { [classes.fridayColumn]: d === 6 })}>
                    <div className={classes.dayContainer}>
                      {reportState?.[r.id]?.[d.toString()]?.map((n, index, self) => {
                        const stcColor = chroma(persistant.userSettings!.stcColors[n.stc] || '#000000');
                        const backgroundColor = n.stc === 'J' ? undefined : chroma.mix(stcColor.saturate(0.4).brighten(1.5), '#fff', 0.5);
                        return (
                          <Fragment key={index}>
                            <div
                              className={classNames(classes.flightContainer, {
                                [classes.afterNoonFlight]:
                                  self.length === 1 &&
                                  ((n.departuerFromIka && n.departuerFromIka >= '1200') || (!n.departuerFromIka && n.arrivalToIka && n.arrivalToIka >= '1200')),
                                [classes.beforeNoonFlight]:
                                  self.length === 1 && ((n.arrivalToIka && n.arrivalToIka <= '1200') || (!n.arrivalToIka && n.departuerFromIka && n.departuerFromIka <= '1200'))
                              })}
                            >
                              <div className={classes.timeContainer}>
                                <div className={classNames(classes.time, classes.timeDeparture)}>{n.departuerFromIka}</div>
                                <div className={classNames(classes.time, classes.timeArrival)}>{n.arrivalToIka}</div>
                              </div>
                              <span style={({ backgroundColor } as unknown) as CSSProperties} className={classes.label}>
                                {n.label}
                              </span>
                              {!!n.note ? <div className={classes.note}>{n.note}</div> : <Fragment />}
                            </div>
                            {self.length > index + 1 ? <div className={classes.plusSeperator}>+</div> : <Fragment />}
                          </Fragment>
                        );
                      })}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </div>
  );
};

// Default values of props when not provided by the user (only for optional props):

export default TimelineReport;
