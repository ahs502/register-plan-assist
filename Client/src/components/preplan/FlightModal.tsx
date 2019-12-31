import React, { Fragment, useContext, useState } from 'react';
import { Theme, Typography, Grid, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
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

const useStyles = makeStyles((theme: Theme) => ({}));

interface ViewState {
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

interface LegViewState {
  std: string;
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
  flight: Flight;
}

export interface FlightModalProps extends BaseModalProps<FlightModalState> {
  onOpenFlightRequirementModal(flightRequirement: FlightRequirement, day: Weekday): void;
}

const FlightModal = createModal<FlightModalState, FlightModalProps>(({ state, onOpenFlightRequirementModal, ...others }) => {
  const preplan = useContext(PreplanContext);
  const reloadPreplan = useContext(ReloadPreplanContext);

  const [viewState, setViewState] = useState<ViewState>(() => ({
    aircraftRegister: dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).convertBusinessToViewOptional(state.flight.aircraftRegister),
    legs: state.flight.legs.map<LegViewState>(l => ({
      std: dataTypes.daytime.convertBusinessToView(l.std)
    }))
  }));

  const validation = new ViewStateValidation(viewState, preplan.aircraftRegisters);
  const errors = {
    aircraftRegister: validation.message('AIRCRAFT_REGISTER_*'),
    stds: validation.$.legValidations?.map(v => v.message('STD_*'))
  };

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      maxWidth="sm"
      complexTitle={
        <Fragment>
          <Typography variant="h6" display="inline">
            {state.flight.label}
          </Typography>
          {!!state.flight.category && (
            <Typography variant="body2" display="inline">
              &nbsp;&nbsp;&nbsp;{state.flight.category}
            </Typography>
          )}
          <Typography variant="h6" display="inline">
            &nbsp;&nbsp;{state.flight.stc.name}&nbsp;&nbsp;
          </Typography>
          <Typography variant="subtitle1" display="inline">
            {Weekday[state.flight.day]}s&nbsp;&nbsp;
          </Typography>
          {state.flight.rsx !== 'REAL' && (
            <Typography variant="overline" display="inline">
              {state.flight.rsx}
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
          action: () => onOpenFlightRequirementModal(state.flight.flightRequirement, state.flight.day)
        },
        {
          title: 'Submit',
          submitter: true,
          disabled: !validation.ok,
          action: async () => {
            if (!validation.ok) throw 'Invalid form fields.';

            const flightModel: FlightModel = state.flight.extractModel(flightModel => ({
              ...flightModel,
              aircraftRegisterId: dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).convertViewToModelOptional(viewState.aircraftRegister),
              legs: viewState.legs.map<FlightLegModel>(l => ({
                ...l,
                std: dataTypes.daytime.convertViewToModel(l.std)
              }))
            }));

            const otherFlightModels: FlightModel[] = preplan.flights
              .filter(f => f.flightRequirement.id === state.flight.flightRequirement.id && f.id !== state.flight.id)
              .map<FlightModel>(f => f.extractModel());

            const newPreplanDataModel = await FlightService.edit(preplan.id, flightModel, ...otherFlightModels);
            await reloadPreplan(newPreplanDataModel);
          }
        }
      ]}
      body={({ handleKeyboardEvent }) => (
        <Grid container spacing={2}>
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
                {state.flight.legs.map((l, index) => (
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
                        value={viewState.legs[index].std}
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
                        error={errors.stds[index] !== undefined}
                        helperText={errors.stds[index]}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {dataTypes.daytime.checkView(viewState.legs[index].std) ? (
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
});

export default FlightModal;

export function useFlightModalState() {
  return useModalState<FlightModalState>();
}
