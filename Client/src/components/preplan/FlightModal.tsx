import React, { FC, Fragment, useContext } from 'react';
import { Theme, Typography, Grid, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalViewState, useModalState } from 'src/components/BaseModal';
import Flight from 'src/business/flight/Flight';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Weekday from '@core/types/Weekday';
import RefiningTextField from 'src/components/RefiningTextField';
import { formFields } from 'src/utils/FormField';
import { PreplanContext, ReloadPreplanContext } from 'src/pages/preplan';
import Validation from '@ahs502/validation';
import { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import FlightService from 'src/services/FlightService';
import FlightModel from '@core/models/flight/FlightModel';
import FlightLegModel from '@core/models/flight/FlightLegModel';
import Preplan from 'src/business/preplan/Preplan';

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
    super(validator => {
      validator.if(!aircraftRegister).check('AIRCRAFT_REGISTER_IS_VALID', () => formFields.preplanAircraftRegister(aircraftRegisters).check(aircraftRegister));
      validator.array(legs).each((leg, index) => validator.put(validator.$.legValidations[index], new LegViewStateValidation(leg)));
    });
  }
}

interface LegViewState {
  std: string;
}
class LegViewStateValidation extends Validation<'STD_EXISTS' | 'STD_FORMAT_IS_VALID'> {
  constructor({ std }: LegViewState) {
    super(validator => validator.check('STD_EXISTS', !!std).check('STD_FORMAT_IS_VALID', () => formFields.daytime.check(std)));
  }
}

export interface FlightModalState {
  flight: Flight;
}

export interface FlightModalProps extends BaseModalProps<FlightModalState> {
  onOpenFlightRequirementModal(flightRequirement: FlightRequirement, day: Weekday): void;
}

const FlightModal: FC<FlightModalProps> = ({ state: [open, { flight }], onOpenFlightRequirementModal, ...others }) => {
  const preplan = useContext(PreplanContext);
  const reloadPreplan = useContext(ReloadPreplanContext);

  const [viewState, setViewState, render] = useModalViewState<ViewState>(
    open,
    {
      aircraftRegister: '',
      legs: []
    },
    () => ({
      aircraftRegister: flight.aircraftRegister === undefined ? '' : formFields.preplanAircraftRegister(preplan.aircraftRegisters).format(flight.aircraftRegister),
      legs: flight.legs.map<LegViewState>(l => ({
        std: formFields.daytime.format(l.std)
      }))
    })
  );

  const validation = new ViewStateValidation(viewState, preplan.aircraftRegisters);

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      open={open}
      maxWidth="sm"
      complexTitle={
        render && (
          <Fragment>
            <Typography variant="h6" display="inline">
              {flight.label}
            </Typography>
            {!!flight.category && (
              <Typography variant="body2" display="inline">
                &nbsp;&nbsp;&nbsp;{flight.category}
              </Typography>
            )}
            <Typography variant="h6" display="inline">
              &nbsp;&nbsp;{flight.stc.name}&nbsp;&nbsp;
            </Typography>
            <Typography variant="subtitle1" display="inline">
              {Weekday[flight.day]}s&nbsp;&nbsp;
            </Typography>
            {flight.rsx !== 'REAL' && (
              <Typography variant="overline" display="inline">
                {flight.rsx}
              </Typography>
            )}
          </Fragment>
        )
      }
      actions={[
        {
          title: 'Cancel'
        },
        {
          title: 'Flight Requirement',
          action: () => onOpenFlightRequirementModal(flight.flightRequirement, flight.day)
        },
        {
          title: 'Submit',
          action: async () => {
            if (!validation.ok) throw 'Invalid form fields.';

            const flightModel: FlightModel = {
              id: flight.id,
              flightRequirementId: flight.flightRequirement.id,
              day: flight.day,
              aircraftRegisterId: viewState.aircraftRegister === '' ? undefined : formFields.preplanAircraftRegister(preplan.aircraftRegisters).parse(viewState.aircraftRegister),
              legs: viewState.legs.map<FlightLegModel>(l => ({
                std: formFields.daytime.parse(l.std)
              }))
            };

            const newPreplanModel = await FlightService.edit(preplan.id, flightModel);
            await reloadPreplan(newPreplanModel);
          },
          disable: !validation.ok
        }
      ]}
    >
      {render && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <RefiningTextField
              fullWidth
              label="Aircraft Register"
              formField={formFields.preplanAircraftRegister(preplan.aircraftRegisters)}
              value={viewState.aircraftRegister}
              onChange={({ target: { value: aircraftRegister } }) => setViewState({ ...viewState, aircraftRegister })}
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
                  <TableCell align="center">STD</TableCell>
                  <TableCell align="center">Block Time</TableCell>
                  <TableCell align="center">STA</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flight.legs.map((l, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">{formFields.flightNumber.format(l.flightNumber)}</TableCell>
                    <TableCell align="center">{formFields.airport.format(l.departureAirport)}</TableCell>
                    <TableCell align="center">{formFields.airport.format(l.arrivalAirport)}</TableCell>
                    <TableCell align="center">
                      <RefiningTextField
                        fullWidth
                        formField={formFields.daytime}
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
                      />
                    </TableCell>
                    <TableCell align="center">{formFields.daytime.format(l.blockTime)}</TableCell>
                    <TableCell align="center">
                      {formFields.daytime.check(viewState.legs[index].std) ? (
                        formFields.daytime.format(formFields.daytime.parse(viewState.legs[index].std) + l.blockTime)
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
    </BaseModal>
  );
};

export default FlightModal;

export function useFlightModalState() {
  return useModalState<FlightModalState>();
}
