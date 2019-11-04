import React, { FC } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalViewState, useModalState } from 'src/components/BaseModal';
import Flight from 'src/business/flight/Flight';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface FlightModalState {
  flight: Flight;
  legIndex?: number;
}

export interface FlightModalProps extends BaseModalProps<FlightModalState> {}

const FlightModal: FC<FlightModalProps> = ({ state: [open, { flight, legIndex }], ...others }) => {
  const [viewState, setViewState] = useModalViewState<{}>(open, {}, () => ({}));

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      open={open}
      title="This is the flight modal!"
      actions={[
        {
          title: 'Cancel'
        }
      ]}
    >
      The modal body contents go here...
    </BaseModal>
  );
};

export default FlightModal;

export function useFlightModalState() {
  return useModalState<FlightModalState>();
}

/* <SimpleModal
        key="edit-flight-pack-modal"
        title={'Flight pack ' + (editFlightPackModalModel.selectedFlightPack && editFlightPackModalModel.selectedFlightPack.label)}
        open={editFlightPackModalModel.open}
        loading={editFlightPackModalModel.loading}
        errorMessage={editFlightPackModalModel.errorMessage}
        cancelable={true}
        actions={[
          { title: 'Close' },
          {
            title: 'Submit',
            action: async () => {
              setEditFlightPackModalModel({ ...editFlightPackModalModel, loading: true, errorMessage: undefined });

              const register = MasterData.all.aircraftRegisters.items.find(n => n.name.toUpperCase() === (editFlightPackModalModel.aircraftRegister || '').toUpperCase());
              const firstFlightStd = parseHHMM(editFlightPackModalModel.std);
              const sortedFlights = editFlightPackModalModel.selectedFlightPack!.flights.orderBy(f => f.std.minutes);
              const firstFlight = sortedFlights[0];
              const delta = firstFlightStd - firstFlight.std.minutes;
              const models = sortedFlights.map(n =>
                n.requirement.extractModel({
                  days: (function() {
                    const dayOverride: DeepWritablePartial<WeekdayFlightRequirementModel> = {
                      [n.requirement.days.findIndex(d => d.day === n.day)]: {
                        scope: (function() {
                          const scopeOverrides: DeepWritablePartial<FlightScopeModel> = {};
                          editFlightPackModalModel.required !== undefined && (scopeOverrides.required = editFlightPackModalModel.required);
                          editFlightPackModalModel.destinationPermission !== undefined && (scopeOverrides.destinationPermission = editFlightPackModalModel.destinationPermission);
                          editFlightPackModalModel.originPermission !== undefined && (scopeOverrides.originPermission = editFlightPackModalModel.originPermission);
                          return scopeOverrides;
                        })(),
                        flight: {
                          std: n.std.minutes + delta,
                          aircraftRegisterId: register && register.id
                        },
                        freezed: editFlightPackModalModel.freezed,
                        notes: editFlightPackModalModel.notes
                      }
                    };

                    editFlightPackModalModel.freezed !== undefined && (dayOverride.freezed = editFlightPackModalModel.freezed);

                    return dayOverride;
                  })()
                })
              );

              preplan.stage({ mergingFlightRequirementModels: models });
              preplan.commit();
              const result = await PreplanService.editFlightRequirements(models);

              if (result.message) {
                setEditFlightPackModalModel(openFlightPackModalModel => ({ ...openFlightPackModalModel, loading: false, errorMessage: result.message }));
              } else {
                preplan.mergeFlightRequirements(...result.value!);
                setEditFlightPackModalModel(openFlightPackModalModel => ({ ...openFlightPackModalModel, loading: false, open: false, errorMessage: undefined }));
              }
            }
          }
        ]}
        onClose={() => setEditFlightPackModalModel({ ...editFlightPackModalModel, open: false, errorMessage: undefined })}
      >
        <Grid container>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Flirst Leg STD"
              value={editFlightPackModalModel.std}
              onChange={s => {
                setEditFlightPackModalModel({ ...editFlightPackModalModel, std: s.target.value });
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Aircraft Register"
              value={editFlightPackModalModel.aircraftRegister}
              onChange={s => {
                setEditFlightPackModalModel({ ...editFlightPackModalModel, aircraftRegister: s.target.value });
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              label="Required"
              control={
                <Checkbox
                  color="primary"
                  indeterminate={editFlightPackModalModel.required === undefined}
                  checked={editFlightPackModalModel.required === undefined ? true : editFlightPackModalModel.required}
                  onChange={e => setEditFlightPackModalModel({ ...editFlightPackModalModel, required: e.target.checked })}
                />
              }
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              label="Freezed"
              control={
                <Checkbox
                  color="primary"
                  indeterminate={editFlightPackModalModel.freezed === undefined}
                  checked={editFlightPackModalModel.freezed === undefined ? true : editFlightPackModalModel.freezed}
                  onChange={e => setEditFlightPackModalModel({ ...editFlightPackModalModel, freezed: e.target.checked })}
                />
              }
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              label="Origin Permission"
              control={
                <Checkbox
                  color="primary"
                  indeterminate={editFlightPackModalModel.originPermission === undefined}
                  checked={editFlightPackModalModel.originPermission === undefined ? true : editFlightPackModalModel.originPermission}
                  onChange={e => setEditFlightPackModalModel({ ...editFlightPackModalModel, originPermission: e.target.checked })}
                />
              }
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              label="Destination Permission"
              control={
                <Checkbox
                  color="primary"
                  indeterminate={editFlightPackModalModel.destinationPermission === undefined}
                  checked={editFlightPackModalModel.destinationPermission === undefined ? true : editFlightPackModalModel.destinationPermission}
                  onChange={e => setEditFlightPackModalModel({ ...editFlightPackModalModel, destinationPermission: e.target.checked })}
                />
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={editFlightPackModalModel.notes}
              onChange={s => setEditFlightPackModalModel({ ...editFlightPackModalModel, notes: s.target.value })}
            />
          </Grid>
        </Grid>
      </SimpleModal> */

/* <SimpleModal
        key="edit-flight-modal"
        title=""
        complexTitle={
          editFlightModalModel.flight && (
            <Fragment>
              Flight
              <span className={classes.openflightModalLabel}> {editFlightModalModel.flight.label} </span>
              <span className={classes.openflightModalFlightNumber}>{editFlightModalModel.flight.flightNumber} </span>
              <span className={classes.openflightModalAirports}>
                {editFlightModalModel.flight.departureAirport.name}-{editFlightModalModel.flight.arrivalAirport.name}{' '}
              </span>
              <span className={classes.openflightModalWeekDay}>{Weekday[editFlightModalModel.flight.day]}s </span>
              <span className={classes.openflightModalStc}>{editFlightModalModel.flight.stc.name} </span>
              {<span className={classes.openflightModalRsx}>{editFlightModalModel.flight.rsx} </span>}
              <span className={classes.openflightModalCategory}>{editFlightModalModel.flight.category} </span>
            </Fragment>
          )
        }
        loading={editFlightModalModel.loading}
        errorMessage={editFlightModalModel.errorMessage}
        open={editFlightModalModel.open}
        cancelable={true}
        actions={[
          { title: 'Close' },
          {
            title: 'Objections',
            action: () => {
              setEditFlightModalModel({ ...editFlightModalModel, open: false });
              setSideBarState({ ...sideBarState, initialSearch: editFlightModalModel.flight!.flightNumber, sideBar: 'OBJECTIONS', open: true });
            }
          },
          {
            title: 'Weekday F.R',
            action: () => {
              onEditWeekdayFlightRequirement(editFlightModalModel.flight!.requirement, editFlightModalModel.flight!.weekdayRequirement);
              setEditFlightModalModel({ ...editFlightModalModel, open: false });
            }
          },
          {
            title: 'Flight Requirment',
            action: () => {
              onEditFlightRequirement(editFlightModalModel.flight!.requirement);
              setEditFlightModalModel({ ...editFlightModalModel, open: false });
            }
          },
          {
            title: 'Apply',
            action: async () => {
              setEditFlightModalModel({ ...editFlightModalModel, loading: true, errorMessage: undefined });
              const flightRequirment = editFlightModalModel.flight!.requirement;
              const register = MasterData.all.aircraftRegisters.items.find(n => n.name.toUpperCase() === (editFlightModalModel.aircraftRegister || '').toUpperCase());
              const model = flightRequirment.extractModel({
                days: {
                  [flightRequirment.days.findIndex(d => d.day === editFlightModalModel.flight!.day)]: {
                    scope: {
                      blockTime: parseHHMM(editFlightModalModel.blockTime),
                      required: editFlightModalModel.required,
                      destinationPermission: editFlightModalModel.destinationPermission,
                      originPermission: editFlightModalModel.originPermission
                    },
                    flight: {
                      std: parseHHMM(editFlightModalModel.std),
                      aircraftRegisterId: register && register.id
                    },
                    freezed: editFlightModalModel.freezed,
                    notes: editFlightModalModel.notes
                  }
                }
              });
              preplan.stage({ mergingFlightRequirementModels: [model] });
              preplan.commit();
              const result = await PreplanService.editFlightRequirements([model]);

              if (result.message) {
                setEditFlightModalModel(openFlightModalModel => ({ ...openFlightModalModel, loading: false, errorMessage: result.message }));
              } else {
                preplan.mergeFlightRequirements(result.value![0]);
                setEditFlightModalModel(openFlightModalModel => ({ ...openFlightModalModel, loading: false, open: false, errorMessage: undefined }));
              }
            }
          }
        ]}
        onClose={() => setEditFlightModalModel({ ...editFlightModalModel, open: false })}
      >
        <Grid container>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="STD"
              value={editFlightModalModel.std}
              onChange={s => {
                setEditFlightModalModel({ ...editFlightModalModel, std: s.target.value });
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Block Time"
              value={editFlightModalModel.blockTime}
              onChange={s => {
                setEditFlightModalModel({ ...editFlightModalModel, blockTime: s.target.value });
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Aircraft Register"
              value={editFlightModalModel.aircraftRegister}
              onChange={s => {
                setEditFlightModalModel({ ...editFlightModalModel, aircraftRegister: s.target.value });
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              label="Required"
              control={
                <Checkbox
                  color="primary"
                  checked={editFlightModalModel.required}
                  onChange={e => setEditFlightModalModel({ ...editFlightModalModel, required: e.target.checked })}
                />
              }
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              label="Freezed"
              control={
                <Checkbox color="primary" checked={editFlightModalModel.freezed} onChange={e => setEditFlightModalModel({ ...editFlightModalModel, freezed: e.target.checked })} />
              }
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              label="Origin Permission"
              control={
                <Checkbox
                  color="primary"
                  checked={editFlightModalModel.originPermission}
                  onChange={e => setEditFlightModalModel({ ...editFlightModalModel, originPermission: e.target.checked })}
                />
              }
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              label="Destination Permission"
              control={
                <Checkbox
                  color="primary"
                  checked={editFlightModalModel.destinationPermission}
                  onChange={e => setEditFlightModalModel({ ...editFlightModalModel, destinationPermission: e.target.checked })}
                />
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Notes" value={editFlightModalModel.notes} onChange={s => setEditFlightModalModel({ ...editFlightModalModel, notes: s.target.value })} />
          </Grid>
        </Grid>
      </SimpleModal> */
