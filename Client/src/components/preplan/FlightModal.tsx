import React, { Fragment, useContext, useState, useMemo } from 'react';
import { Theme, Typography, Grid, Table, TableHead, TableRow, TableCell, TableBody, FormControlLabel, Checkbox } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalState, createModal } from 'src/components/BaseModal';
import Flight from 'src/business/flight/Flight';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Weekday from '@core/types/Weekday';
import RefiningTextField from 'src/components/RefiningTextField';
import { dataTypes } from 'src/utils/DataType';
import { PreplanContext, ReloadPreplanContext } from 'src/pages/preplan';
import Validation from '@ahs502/validation';
import { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import FlightService from 'src/services/FlightService';
import FlightModel from '@core/models/flight/FlightModel';
import FlightLegModel from '@core/models/flight/FlightLegModel';
import Daytime from '@core/types/Daytime';
import Preplan from 'src/business/preplan/Preplan';
import classNames from 'classnames';
import chroma from 'chroma-js';

const useStyles = makeStyles((theme: Theme) => ({
  flightDates: {
    width: '100%',
    display: 'flex'
  },
  flightDate: {
    width: 10,
    flexGrow: 1,
    position: 'relative',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 4,
    margin: '2px 1px 0 1px',
    padding: '2px 0 1px 3px',
    color: theme.palette.common.black,
    overflow: 'hidden',
    fontSize: '12px',
    userSelect: 'none',
    cursor: 'pointer',
    '&:hover $flightDateHover': {
      display: 'block'
    }
  },
  flightDateHover: {
    display: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#0002',
    userSelect: 'none',
    pointerEvents: 'none'
  },
  flightDateDisabled: {
    backgroundColor: chroma(theme.palette.grey[400])
      .alpha(0.4)
      .hex(),
    borderColor: theme.palette.grey[600]
  },
  flightDateSelected: {
    backgroundColor: chroma(theme.palette.secondary.main)
      .alpha(0.4)
      .hex(),
    borderColor: theme.palette.secondary.dark
  }
}));

interface ViewState {
  dates: DateViewState[];
  dateSelectionStartIndex?: number;
  aircraftRegister: string;
  legs: LegViewState[];
}
class ViewStateValidation extends Validation<
  'AIRCRAFT_REGISTER_IS_VALID',
  {
    legValidations: LegViewStateValidation[];
  }
> {
  constructor({ aircraftRegister, legs }: ViewState, aircraftRegisters: PreplanAircraftRegisters) {
    super(
      validator => {
        validator.if(!!aircraftRegister).check('AIRCRAFT_REGISTER_IS_VALID', () => dataTypes.preplanAircraftRegister(aircraftRegisters).checkView(aircraftRegister));
        validator.array(legs).each((leg, index) => validator.put(validator.$.legValidations[index], new LegViewStateValidation(leg)));
      },
      {
        '*_EXISTS': 'Required.',
        '*_FORMAT_IS_VALID': 'Invalid format.',
        '*_IS_VALID': 'Invalid.',
        '*_IS_NOT_NEGATIVE': 'Should not be negative.'
      }
    );
  }
}

interface DateViewState {
  disabled: boolean;
  selected: boolean;
}

interface LegViewState {
  blockTime: string;
  std: string;
  sta: string;
}

class LegViewStateValidation extends Validation<'STD_EXISTS' | 'STD_FORMAT_IS_VALID'> {
  constructor({ std }: LegViewState) {
    super(validator => validator.check('STD_EXISTS', !!std).check('STD_FORMAT_IS_VALID', () => dataTypes.daytime.checkView(std)), {
      '*_EXISTS': 'Required.',
      '*_FORMAT_IS_VALID': 'Invalid format.',
      '*_IS_VALID': 'Invalid.',
      '*_IS_NOT_NEGATIVE': 'Should not be negative.'
    });
  }
}

export interface FlightModalState {
  flightRequirement: FlightRequirement;
  day: Weekday;
  selectedFlights?: readonly Flight[];
}

export interface FlightModalProps extends BaseModalProps<FlightModalState> {
  onOpenFlightRequirementModal(flightRequirement: FlightRequirement, day: Weekday): void;
}

const FlightModal = createModal<FlightModalState, FlightModalProps>(({ state, onOpenFlightRequirementModal, ...others }) => {
  const preplan = useContext(PreplanContext);
  const reloadPreplan = useContext(ReloadPreplanContext);

  const flights = useMemo(() => preplan.flights.filter(f => f.flightRequirement === state.flightRequirement && f.day === state.day), [preplan]);

  const [viewState, setViewState] = useState<ViewState>(() => {
    const selectedFlights: readonly Flight[] = state.selectedFlights ?? flights;

    return calculateViewState(selectedFlights, preplan, flights, state);
  });

  const validation = new ViewStateValidation(viewState, preplan.aircraftRegisters);
  const errors = {
    aircraftRegister: validation.message('AIRCRAFT_REGISTER_*'),
    stds: validation.$.legValidations?.map(v => v.message('STD_*'))
  };

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      maxWidth="lg"
      complexTitle={
        <Fragment>
          <Typography variant="h6" display="inline">
            {state.flightRequirement.label}
          </Typography>
          {!!state.flightRequirement.category && (
            <Typography variant="body2" display="inline">
              &nbsp;&nbsp;&nbsp;{state.flightRequirement.category}
            </Typography>
          )}
          <Typography variant="h6" display="inline">
            &nbsp;&nbsp;{state.flightRequirement.stc.name}&nbsp;&nbsp;
          </Typography>
          <Typography variant="subtitle1" display="inline">
            {Weekday[state.day]}s&nbsp;&nbsp;
          </Typography>
          {state.flightRequirement.rsx !== 'REAL' && (
            <Typography variant="overline" display="inline">
              {state.flightRequirement.rsx}
            </Typography>
          )}
        </Fragment>
      }
      actions={[
        {
          title: 'Cancel',
          canceler: true
        },
        {
          title: 'Flight Requirement',
          action: () => onOpenFlightRequirementModal(state.flightRequirement, state.day)
        },
        {
          title: 'Submit',
          submitter: true,
          disabled: !validation.ok,
          action: async () => {
            if (!validation.ok) throw 'Invalid form fields.';

            const selectedFlights = viewState.dates
              .map((d, dayIndex) => {
                if (!d.selected || d.disabled) return undefined;
                return flights.find(
                  f =>
                    dataTypes.utcDate.convertBusinessToView(f.date) === dataTypes.utcDate.convertBusinessToView(new Date(preplan.weeks.all[dayIndex].startDate).addDays(state.day))
                );
              })
              .filter(Boolean) as Flight[];

            const flightModels: FlightModel[] = selectedFlights.map(f =>
              f.extractModel(flightModel => {
                const aircraftRegisterId = dataTypes.aircraftRegister.checkView(viewState.aircraftRegister)
                  ? dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).convertViewToModelOptional(viewState.aircraftRegister)
                  : flightModel.aircraftRegisterId;
                return {
                  ...flightModel,
                  aircraftRegisterId: aircraftRegisterId,
                  legs: viewState.legs.map<FlightLegModel>((l, index) => ({
                    ...l,
                    std: dataTypes.daytime.checkView(l.std) ? dataTypes.daytime.convertViewToModel(l.std) : flightModel.legs[index].std
                  }))
                };
              })
            );

            // const otherFlightModels: FlightModel[] = preplan.flights
            //   .filter(f => f.flightRequirement.id === state.flight.flightRequirement.id && f.id !== state.flight.id)
            //   .map<FlightModel>(f => f.extractModel());
            const otherFlightModels = preplan.flights
              .filter(f => f.flightRequirement === state.flightRequirement && !flightModels.some(n => n.id === f.id))
              .map<FlightModel>(f => f.extractModel());

            const newPreplanDataModel = await FlightService.edit(preplan.id, ...flightModels, ...otherFlightModels);
            await reloadPreplan(newPreplanDataModel);
          }
        }
      ]}
      body={({ handleKeyboardEvent }) => (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <div className={classes.flightDates}>
              {viewState.dates.map((date, index) => {
                const flightDate = preplan.weeks.all[index].startDate.clone().addDays(state.day);

                return (
                  <div
                    key={index}
                    className={classNames(classes.flightDate, {
                      [classes.flightDateDisabled]: date.disabled,
                      [classes.flightDateSelected]: date.selected
                    })}
                    title={`Flight at ${flightDate.format('d')}`}
                    onClick={() =>
                      date.disabled ||
                      setViewState({
                        ...viewState,
                        dates: [
                          ...viewState.dates.slice(0, index),
                          {
                            ...date,
                            selected: !date.selected
                          },
                          ...viewState.dates.slice(index + 1)
                        ]
                      })
                    }
                  >
                    {formatDate(flightDate)}
                    <div className={classes.flightDateHover} />
                  </div>
                );
              })}
            </div>
          </Grid>
          {/* <Grid item xs={12}>
            {viewState.dates.map((w, index) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={w.selected}
                    onChange={({ target: { checked: selected } }) => {
                      //setViewState({ ...viewState, dates: [...viewState.dates.slice(0, index), { ...w, selected }, ...viewState.dates.slice(index + 1)] })
                      const selectedFlights = viewState.dates
                        .map((d, dayIndex) => {
                          if ((dayIndex === index && !selected) || (dayIndex !== index && !d.selected)) return undefined;
                          return flights.find(
                            f =>
                              dataTypes.utcDate.convertBusinessToView(f.date) ===
                              dataTypes.utcDate.convertBusinessToView(new Date(preplan.weeks.all[dayIndex].startDate).addDays(state.day))
                          );
                        })
                        .filter(Boolean) as Flight[];

                      setViewState(calculateViewState(selectedFlights, preplan, flights, state));
                    }}
                    color="primary"
                    disabled={w.disabled}
                  />
                }
                label={new Date(preplan.weeks.all[index].startDate).addDays(state.day).format('d')}
              />
            ))}
          </Grid> */}
          <Grid item xs={12}>
            <RefiningTextField
              fullWidth
              autoFocus
              label="Aircraft Register"
              dataType={dataTypes.preplanAircraftRegister(preplan.aircraftRegisters)}
              value={viewState.aircraftRegister}
              onChange={({ target: { value: aircraftRegister } }) => setViewState({ ...viewState, aircraftRegister })}
              onKeyDown={handleKeyboardEvent}
              error={errors.aircraftRegister !== undefined}
              helperText={errors.aircraftRegister}
              disabled={viewState.legs.length === 0}
            />
          </Grid>
          <Grid item xs={12}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">#</TableCell>
                  <TableCell align="center">Flight Number</TableCell>
                  <TableCell align="center">Departure</TableCell>
                  <TableCell align="center">Arrival</TableCell>
                  <TableCell align="center">Block Time</TableCell>
                  <TableCell align="center">STD</TableCell>
                  <TableCell align="center">STA</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flights[0].legs.map((l, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">{dataTypes.flightNumber.convertBusinessToView(l.flightNumber)}</TableCell>
                    <TableCell align="center">{dataTypes.airport.convertBusinessToView(l.departureAirport)}</TableCell>
                    <TableCell align="center">{dataTypes.airport.convertBusinessToView(l.arrivalAirport)}</TableCell>
                    <TableCell align="center">{l.blockTime.toString('HH:mm', true)}</TableCell>
                    <TableCell align="center">
                      <RefiningTextField
                        fullWidth
                        dataType={dataTypes.daytime}
                        value={viewState.legs[index]?.std ?? ''}
                        onChange={({ target: { value: std } }) =>
                          setViewState({
                            ...viewState,
                            legs: [
                              ...viewState.legs.slice(0, index),
                              {
                                ...viewState.legs[index],
                                std
                              },
                              ...viewState.legs.slice(index + 1)
                            ]
                          })
                        }
                        onKeyDown={handleKeyboardEvent}
                        error={errors.stds?.[index] !== undefined}
                        helperText={errors.stds?.[index]}
                        disabled={viewState.legs.length === 0}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {dataTypes.daytime.checkView(viewState.legs[index]?.std) ? (
                        new Daytime(dataTypes.daytime.convertViewToModel(viewState.legs[index].std) + l.blockTime.minutes).toString('HH:mm', true)
                      ) : (
                        <Fragment>&mdash;</Fragment>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      )}
    />
  );

  function calculateViewState(selectedFlights: readonly Flight[], preplan: Preplan, flights: Flight[], state: FlightModalState) {
    const selectedFlightsRegister = getAircraftRegister(selectedFlights);
    const selectedFlightStds = selectedFlights.reduce<string[][]>((acc, current) => {
      current.legs.forEach((l, index) => {
        const std = dataTypes.daytime.convertBusinessToView(l.std);
        acc[index] = acc[index] ?? ([] as string[]);
        if (!acc[index].some(s => s === std)) acc[index].push(std);
      });
      return acc;
    }, []);
    const selectedFlightStas = selectedFlights.reduce<string[][]>((acc, current) => {
      current.legs.forEach((l, index) => {
        const sta = dataTypes.daytime.convertBusinessToView(l.sta);
        acc[index] = acc[index] ?? ([] as string[]);
        if (!acc[index].some(s => s === sta)) acc[index].push(sta);
      });
      return acc;
    }, []);
    const selectedFlightBlockTimes = selectedFlights.reduce<string[][]>((acc, current) => {
      current.legs.forEach((l, index) => {
        const blockTime = dataTypes.daytime.convertBusinessToView(l.blockTime);
        acc[index] = acc[index] ?? ([] as string[]);
        if (!acc[index].some(s => s === blockTime)) acc[index].push(blockTime);
      });
      return acc;
    }, []);
    return {
      aircraftRegister: selectedFlightsRegister,
      legs: selectedFlightStds.map<LegViewState>((l, index) => ({
        blockTime: selectedFlightBlockTimes[index].length > 1 ? '—' : selectedFlightBlockTimes[index][0],
        std: l.length > 1 ? '' : l[0],
        sta: selectedFlightStas[index].length > 1 ? '—' : selectedFlightStas[index][0]
      })),
      dates: preplan.weeks.all.map<DateViewState>(w => ({
        disabled: !flights.some(f => dataTypes.utcDate.convertBusinessToView(f.date) === dataTypes.utcDate.convertBusinessToView(new Date(w.startDate).addDays(state.day))),
        selected: selectedFlights.some(f => dataTypes.utcDate.convertBusinessToView(f.date) === dataTypes.utcDate.convertBusinessToView(new Date(w.startDate).addDays(state.day)))
      }))
    };

    function getAircraftRegister(flights: readonly Flight[]): string {
      const aircraftRegisters = flights.map(f => dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).convertBusinessToViewOptional(f.aircraftRegister)).distinct();
      return aircraftRegisters.length === 1 ? aircraftRegisters[0] : '';
    }
  }

  function formatDate(date: Date): JSX.Element {
    const dateString = date.format('d');
    const day = dateString[0] === '0' ? dateString.slice(1, 2) : dateString.slice(0, 2);
    const month = dateString.slice(2, 5);
    return (
      <Fragment>
        {day}&nbsp;{month}
      </Fragment>
    );
  }
});

export default FlightModal;

export function useFlightModalState() {
  return useModalState<FlightModalState>();
}
