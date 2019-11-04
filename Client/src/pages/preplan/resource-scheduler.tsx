import React, { FC, Fragment, useState, useContext, useCallback } from 'react';
import { Theme, IconButton, Badge, Drawer, Portal, CircularProgress, Grid, TextField, Checkbox, FormControlLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { DoneAll as FinilizedIcon, LockOutlined as LockIcon, LockOpenOutlined as LockOpenIcon, Search as SearchIcon, SettingsOutlined as SettingsIcon } from '@material-ui/icons';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import LinkIconButton from 'src/components/LinkIconButton';
import { NavBarToolsContainerContext, PreplanContext, ReloadPreplanContext } from 'src/pages/preplan';
import SearchFlightsSideBar from 'src/components/preplan/resource-scheduler/SearchFlightsSideBar';
import ObjectionsSideBar from 'src/components/preplan/resource-scheduler/ObjectionsSideBar';
import SelectAircraftRegistersSideBar from 'src/components/preplan/resource-scheduler/SelectAircraftRegistersSideBar';
import SettingsSideBar from 'src/components/preplan/resource-scheduler/SettingsSideBar';
import ResourceSchedulerView from 'src/components/preplan/resource-scheduler/ResourceSchedulerView';
import Preplan from 'src/business/preplan/Preplan';
import PreplanService from 'src/services/PreplanService';
import { useSnackbar } from 'notistack';
import PreplanAircraftRegister from 'src/business/preplan/PreplanAircraftRegister';
import BaseModal from 'src/components/BaseModal';
import Weekday from '@core/types/Weekday';
import { red, blue, green, cyan, indigo, orange, purple } from '@material-ui/core/colors';
import StatusBar, { StatusBarProps } from 'src/components/preplan/resource-scheduler/StatusBar';
import Flight from 'src/business/flight/Flight';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import PreplanModel from '@core/models/preplan/PreplanModel';
import Objectionable from 'src/business/constraints/Objectionable';
import FlightLeg from 'src/business/flight/FlightLeg';
import FlightService from 'src/services/FlightService';

const useStyles = makeStyles((theme: Theme) => ({
  sideBarBackdrop: {
    backgroundColor: 'transparent'
  },
  sideBarPaper: {
    top: 105,
    height: 'calc(100% - 105px)'
  },
  statusBarWrapper: {
    height: 54,
    margin: 0,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
    whiteSpace: 'pre'
  },
  errorBadge: {
    margin: theme.spacing(2)
  },
  formDaysSelect: {
    padding: theme.spacing(1, 3)
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -24,
    marginLeft: -24,
    zIndex: 2000
  },
  disable: {
    opacity: 0.5
  },
  openflightModalLabel: {
    color: red[500]
  },
  openflightModalFlightNumber: {
    color: blue[500]
  },
  openflightModalAirports: {
    color: green[500]
  },
  openflightModalWeekDay: {
    color: cyan[500]
  },
  openflightModalStc: {
    color: purple[500]
  },
  openflightModalRsx: {
    color: indigo[500]
  },
  openflightModalCategory: {
    color: orange[500]
  }
}));

type SideBar = 'SETTINGS' | 'SELECT_AIRCRAFT_REGISTERS' | 'SEARCH_FLIGHTS' | 'OBJECTIONS';

interface SideBarState {
  open: boolean;
  loading?: boolean;
  errorMessage?: string | undefined;
  sideBar?: SideBar;
  initialSearch?: string;
}

interface ResourceSchedulerViewModel {
  selectedFlight?: Flight;
  loading?: boolean;
}

// interface EditFlightModalModel {
//   open: boolean;
//   loading?: boolean;
//   errorMessage?: string;
//   flight?: Flight;
//   std?: string;
//   blockTime?: string;
//   aircraftRegister?: string;
//   required?: boolean;
//   freezed?: boolean;
//   originPermission?: boolean;
//   destinationPermission?: boolean;
//   notes?: string;
// }

// interface EditFlightPackModalModel {
//   open: boolean;
//   selectedFlightPack?: Flight;
//   loading?: boolean;
//   errorMessage?: string;
//   std?: string;
//   aircraftRegister?: string;
//   required?: boolean;
//   freezed?: boolean;
//   originPermission?: boolean;
//   destinationPermission?: boolean;
//   notes?: string;
// }

export interface ResourceSchedulerPageProps {
  onObjectionTargetClick(target: Objectionable): void;
  onEditFlightRequirement(flightRequirement: FlightRequirement): void;
  onEditDayFlightRequirement(dayFlightRequirement: DayFlightRequirement): void;
}

const ResourceSchedulerPage: FC<ResourceSchedulerPageProps> = ({ onObjectionTargetClick, onEditFlightRequirement, onEditDayFlightRequirement }) => {
  const preplan = useContext(PreplanContext);
  const reloadPreplan = useContext(ReloadPreplanContext);

  const [sideBarState, setSideBarState] = useState<SideBarState>({ open: false, loading: false, errorMessage: undefined });
  const [resourceSchedulerViewModel, setResourceSchedulerViewModel] = useState<ResourceSchedulerViewModel>({ loading: false });
  const [statusBarProps, setStatusBarProps] = useState<StatusBarProps>({});

  // const [editFlightModalModel, setEditFlightModalModel] = useState<EditFlightModalModel>({ open: false });
  // const [editFlightPackModalModel, setEditFlightPackModalModel] = useState<EditFlightPackModalModel>({ open: false });

  const snackbar = useSnackbar();

  const onSelectFlightMemoized = useCallback(
    (flight: Flight) => setResourceSchedulerViewModel(resourceSchedulerViewModel => ({ ...resourceSchedulerViewModel, selectedFlight: flight })),
    []
  );
  const onOpenFlightModalMemoized = useCallback((flight: Flight) => {
    // setEditFlightModalModel({
    //   ...editFlightModalModel,
    //   open: true,
    //   flight: flight,
    //   std: parseMinute(flight.std.minutes),
    //   aircraftRegister: flight.aircraftRegister!.name,
    //   blockTime: parseMinute(flight.blockTime),
    //   required: flight.required,
    //   freezed: flight.freezed,
    //   originPermission: flight.originPermission,
    //   destinationPermission: flight.destinationPermission,
    //   notes: flight.notes
    // });
  }, []);
  const onOpenFlightLegModalMemoized = useCallback((flightLeg: FlightLeg) => {
    // setEditFlightPackModalModel({
    //   ...editFlightPackModalModel,
    //   open: true,
    //   std: parseMinute(flightPack.start.minutes),
    //   aircraftRegister: flightPack.aircraftRegister && flightPack.aircraftRegister.name,
    //   required: flightPack.required,
    //   destinationPermission: flightPack.destinationPermission,
    //   freezed: flightPack.freezed,
    //   notes: flightPack.notes,
    //   originPermission: flightPack.originPermission,
    //   selectedFlightPack: flightPack
    // });
  }, []);
  const onFlightDragAndDropMemoized = useCallback(async (flight: Flight, deltaStd: number, newAircraftRegister?: PreplanAircraftRegister) => {
    setResourceSchedulerViewModel(resourceSchedulerViewModel => ({ ...resourceSchedulerViewModel, loading: true }));
    try {
      const newPreplanModel = await FlightService.edit(
        preplan.id,
        flight.extractModel({ aircraftRegisterId: newAircraftRegister ? newAircraftRegister.id : undefined, legs: flight.legs.map(l => ({ std: l.std.minutes + deltaStd })) })
      );
      reloadPreplan(newPreplanModel);
    } catch (reason) {
      snackbar.enqueueSnackbar(String(reason), { variant: 'error' });
    }
    setResourceSchedulerViewModel(resourceSchedulerViewModel => ({ ...resourceSchedulerViewModel, loading: false }));
  }, []);
  const onFlightMouseHoverMemoized = useCallback((flight: Flight) => setStatusBarProps({ mode: 'FLIGHT', flight }), []);
  const onFreeSpaceMouseHoverMemoized = useCallback(
    (aircraftRegister: PreplanAircraftRegister, previousFlight?: Flight, nextFlight?: Flight) =>
      setStatusBarProps({ mode: 'FREE_SPACE', aircraftRegister, previousFlight, nextFlight }),
    []
  );
  const onNowhereMouseHoverMemoized = useCallback(() => setStatusBarProps({}), []);

  const navBarToolsContainer = useContext(NavBarToolsContainerContext);

  const classes = useStyles();

  return (
    <Fragment>
      {resourceSchedulerViewModel.loading && <CircularProgress size={48} className={classes.progress} />}
      <Portal container={navBarToolsContainer}>
        <div className={resourceSchedulerViewModel.loading ? classes.disable : ''}>
          <IconButton disabled={resourceSchedulerViewModel.loading} color="inherit" title="Finilize Preplan">
            <FinilizedIcon />
          </IconButton>
          <LinkIconButton disabled={resourceSchedulerViewModel.loading} color="inherit" to={`/preplan/${preplan.id}/flight-requirement-list`} title="Flight Requirments">
            <MahanIcon type={MahanIconType.FlightIcon} />
          </LinkIconButton>
          <LinkIconButton disabled={resourceSchedulerViewModel.loading} color="inherit" title="Reports" to={`/preplan/${preplan.id}/reports`}>
            <MahanIcon type={MahanIconType.Chart} />
          </LinkIconButton>
          <IconButton
            disabled={resourceSchedulerViewModel.loading}
            color="inherit"
            onClick={() => setSideBarState({ ...sideBarState, sideBar: 'SEARCH_FLIGHTS', open: true })}
            title="Search Flights"
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            disabled={resourceSchedulerViewModel.loading}
            color="inherit"
            onClick={() => setSideBarState({ ...sideBarState, sideBar: 'OBJECTIONS', open: true })}
            title="Errors and Warnings"
          >
            <Badge badgeContent={preplan.constraintSystem.objections.length} color="secondary" invisible={preplan.constraintSystem.objections.length === 0}>
              <MahanIcon type={MahanIconType.Alert} fontSize="inherit" />
            </Badge>
          </IconButton>
          <IconButton
            disabled={resourceSchedulerViewModel.loading}
            color="inherit"
            onClick={() => setSideBarState({ ...sideBarState, sideBar: 'SELECT_AIRCRAFT_REGISTERS', open: true })}
            title="Select Aircraft Register"
          >
            <MahanIcon type={MahanIconType.Flights} />
          </IconButton>
          {/* <IconButton disabled color="inherit" onClick={() => setSideBarState({ ...sideBarState, sideBar: 'SETTINGS', open: true })} title="Settings">
            <SettingsIcon />
          </IconButton> */}
        </div>
      </Portal>

      <Drawer
        anchor="right"
        open={sideBarState.open}
        onClose={() => setSideBarState({ ...sideBarState, open: false })}
        ModalProps={{ BackdropProps: { classes: { root: classes.sideBarBackdrop } } }}
        classes={{ paper: classes.sideBarPaper }}
      >
        {/* {sideBarState.sideBar === 'SETTINGS' && <SettingsSideBar autoArrangerOptions={preplan.autoArrangerOptions} onApply={() => alert('TODO: Not implemented.')} />} */}
        {sideBarState.sideBar === 'SELECT_AIRCRAFT_REGISTERS' && (
          <SelectAircraftRegistersSideBar
            initialSearch={sideBarState.initialSearch}
            loading={sideBarState.loading}
            onApply={async (dummyAircraftRegisters, aircraftRegisterOptions) => {
              setSideBarState(sideBarState => ({ ...sideBarState, loading: true, errorMessage: '' }));
              try {
                const newPreplanModel = await PreplanService.setAircraftRegisters(preplan.id, dummyAircraftRegisters, aircraftRegisterOptions);
                setSideBarState(sideBarState => ({ ...sideBarState, loading: false, open: false }));
                reloadPreplan(newPreplanModel);
              } catch (reason) {
                setSideBarState(sideBarState => ({ ...sideBarState, loading: false, errorMessage: String(reason) }));
              }
            }}
            errorMessage={sideBarState.errorMessage}
          />
        )}
        {sideBarState.sideBar === 'SEARCH_FLIGHTS' && (
          <SearchFlightsSideBar
            initialSearch={sideBarState.initialSearch}
            onClick={flightLeg => setResourceSchedulerViewModel({ ...resourceSchedulerViewModel, selectedFlight: flightLeg.flight })}
          />
        )}
        {sideBarState.sideBar === 'OBJECTIONS' && <ObjectionsSideBar initialSearch={sideBarState.initialSearch} onClick={onObjectionTargetClick} />}
      </Drawer>

      <div className={resourceSchedulerViewModel.loading ? classes.disable : ''}>
        <ResourceSchedulerView
          selectedFlight={resourceSchedulerViewModel.selectedFlight}
          onSelectFlight={onSelectFlightMemoized}
          onOpenFlightModal={onOpenFlightModalMemoized}
          onOpenFlightLegModal={onOpenFlightLegModalMemoized}
          onFlightDragAndDrop={onFlightDragAndDropMemoized}
          onFlightMouseHover={onFlightMouseHoverMemoized}
          onFreeSpaceMouseHover={onFreeSpaceMouseHoverMemoized}
          onNowhereMouseHover={onNowhereMouseHoverMemoized}
        />
        <div className={classes.statusBarWrapper}>
          <StatusBar {...statusBarProps} />
        </div>
      </div>

      {/* <SimpleModal
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
      </SimpleModal> */}

      {/* <SimpleModal
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
      </SimpleModal> */}
    </Fragment>
  );
};

export default ResourceSchedulerPage;
