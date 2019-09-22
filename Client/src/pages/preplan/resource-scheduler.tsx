import React, { FC, Fragment, useState, useContext, useCallback, useEffect } from 'react';
import { Theme, IconButton, Badge, Drawer, Portal, CircularProgress, Typography, Grid, TextField, Checkbox, FormControlLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { DoneAll as FinilizedIcon, LockOutlined as LockIcon, LockOpenOutlined as LockOpenIcon, Search as SearchIcon, SettingsOutlined as SettingsIcon } from '@material-ui/icons';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import LinkIconButton from 'src/components/LinkIconButton';
import { NavBarToolsContainerContext } from 'src/pages/preplan';
import AutoArrangerChangeLogSideBar from 'src/components/preplan/resource-scheduler/AutoArrangerChangeLogSideBar';
import SearchFlightsSideBar from 'src/components/preplan/resource-scheduler/SearchFlightsSideBar';
import ObjectionsSideBar from 'src/components/preplan/resource-scheduler/ObjectionsSideBar';
import SelectAircraftRegistersSideBar from 'src/components/preplan/resource-scheduler/SelectAircraftRegistersSideBar';
import SettingsSideBar from 'src/components/preplan/resource-scheduler/SettingsSideBar';
import ResourceSchedulerView from 'src/components/preplan/resource-scheduler/ResourceSchedulerView';
import Preplan from 'src/business/Preplan';
import FlightRequirement from 'src/business/flights/FlightRequirement';
import WeekdayFlightRequirement from 'src/business/flights/WeekdayFlightRequirement';
import Flight from 'src/business/flights/Flight';
import FlightPack from 'src/business/flights/FlightPack';
import PreplanService from 'src/services/PreplanService';
import { useSnackbar, VariantType } from 'notistack';
import PreplanAircraftRegister from 'src/business/PreplanAircraftRegister';
import SimpleModal from 'src/components/SimpleModal';
import Weekday from '@core/types/Weekday';
import { red, blue, green, cyan, indigo, orange, purple } from '@material-ui/core/colors';
import { parseMinute, parseHHMM } from 'src/utils/model-parsers';
import MasterData from '@core/master-data';
import StatusBar, { StatusBarProps } from 'src/components/preplan/resource-scheduler/StatusBar';
import DeepWritablePartial from '@core/types/DeepWritablePartial';
import { FlightScopeModel } from '@core/models/flights/FlightScopeModel';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';

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

type SideBar = 'SETTINGS' | 'SELECT_AIRCRAFT_REGISTERS' | 'SEARCH_FLIGHTS' | 'AUTO_ARRANGER_CHANGE_LOG' | 'OBJECTIONS';

interface SideBarState {
  open: boolean;
  loading?: boolean;
  errorMessage?: string | undefined;
  sideBar?: SideBar;
  initialSearch?: string;
}

interface ResourceSchedulerViewModel {
  selectedFlightPack?: FlightPack;
  loading?: boolean;
}

interface ConfirmIgnoreFlightPackModalModel {
  open: boolean;
  selectedFlightPack?: FlightPack;
  loading?: boolean;
  errorMessage?: string;
}

interface EditFlightModalModel {
  open: boolean;
  loading?: boolean;
  errorMessage?: string;
  flight?: Flight;
  std?: string;
  blockTime?: string;
  aircraftRegister?: string;
  required?: boolean;
  freezed?: boolean;
  originPermission?: boolean;
  destinationPermission?: boolean;
  notes?: string;
}

interface EditFlightPackModalModel {
  open: boolean;
  selectedFlightPack?: FlightPack;
  loading?: boolean;
  errorMessage?: string;
  std?: string;
  aircraftRegister?: string;
  required?: boolean;
  freezed?: boolean;
  originPermission?: boolean;
  destinationPermission?: boolean;
  notes?: string;
}

export interface ResourceSchedulerPageProps {
  preplan: Preplan;
  onEditFlightRequirement(flightRequirement: FlightRequirement): void;
  onEditWeekdayFlightRequirement(flightRequirement: FlightRequirement, weekdayFlightRequirement: WeekdayFlightRequirement): void;
}

const ResourceSchedulerPage: FC<ResourceSchedulerPageProps> = ({ preplan, onEditFlightRequirement, onEditWeekdayFlightRequirement }) => {
  const [autoArrangerRunning, setAutoArrangerRunning] = useState(() => false); //TODO: Initialize by data from server.
  const [allFlightsFreezed, setAllFlightsFreezed] = useState(() => false); //TODO: Initialize from preplan flights.
  const [sideBarState, setSideBarState] = useState<SideBarState>({ open: false, loading: false, errorMessage: undefined });

  const [resourceSchedulerViewModel, setResourceSchedulerViewModel] = useState<ResourceSchedulerViewModel>({ loading: false });
  const [statusBarProps, setStatusBarProps] = useState<StatusBarProps>({});

  const [confirmIgnoreFlightPackModalModel, setConfirmIgnoreFlightPackModalModel] = useState<ConfirmIgnoreFlightPackModalModel>({ open: false });
  const [editFlightModalModel, setEditFlightModalModel] = useState<EditFlightModalModel>({ open: false });
  const [editFlightPackModalModel, setEditFlightPackModalModel] = useState<EditFlightPackModalModel>({ open: false });

  const snackbar = useSnackbar();

  const onSelectFlightPackMemoized = useCallback(
    (flightPack: FlightPack) => setResourceSchedulerViewModel(resourceSchedulerViewModel => ({ ...resourceSchedulerViewModel, selectedFlightPack: flightPack })),
    []
  );
  const onFreezeFlightPackMemoized = useCallback(async (flightPack: FlightPack, freezed: boolean) => {
    setResourceSchedulerViewModel(resourceSchedulerViewModel => ({ ...resourceSchedulerViewModel, loading: true }));
    preplan.stage({
      mergingFlightRequirementModels: flightPack.flights.map(f =>
        f.requirement.extractModel({
          days: { [f.requirement.days.findIndex(d => d.day === f.day)]: { freezed } }
        })
      )
    });
    preplan.commit();
    const result = await PreplanService.editFlightRequirements(
      flightPack.flights.map(f =>
        f.requirement.extractModel({
          days: { [f.requirement.days.findIndex(d => d.day === f.day)]: { freezed } }
        })
      )
    );
    result.message ? snackbar.enqueueSnackbar(result.message, { variant: 'error' }) : preplan.mergeFlightRequirements(...result.value!);
    setResourceSchedulerViewModel(resourceSchedulerViewModel => ({ ...resourceSchedulerViewModel, loading: false }));
  }, []);
  const onRequireFlightPackMemoized = useCallback(async (flightPack: FlightPack, required: boolean) => {
    setResourceSchedulerViewModel(resourceSchedulerViewModel => ({ ...resourceSchedulerViewModel, loading: true }));
    preplan.stage({
      mergingFlightRequirementModels: flightPack.flights.map(f =>
        f.requirement.extractModel({
          days: { [f.requirement.days.findIndex(d => d.day === f.day)]: { scope: { required } } }
        })
      )
    });
    preplan.commit();
    const result = await PreplanService.editFlightRequirements(
      flightPack.flights.map(f =>
        f.requirement.extractModel({
          days: { [f.requirement.days.findIndex(d => d.day === f.day)]: { scope: { required } } }
        })
      )
    );
    result.message ? snackbar.enqueueSnackbar(result.message, { variant: 'error' }) : preplan.mergeFlightRequirements(...result.value!);
    setResourceSchedulerViewModel(resourceSchedulerViewModel => ({ ...resourceSchedulerViewModel, loading: false }));
  }, []);
  const onIgnoreFlightPackMemoized = useCallback(async (flightPack: FlightPack) => {
    setConfirmIgnoreFlightPackModalModel(confirmIgnoreFlightPackModalModel => ({ ...confirmIgnoreFlightPackModalModel, selectedFlightPack: flightPack, open: true }));
  }, []);
  const onOpenFlightModalMemoized = useCallback((flight: Flight) => {
    setEditFlightModalModel({
      ...editFlightModalModel,
      open: true,
      flight: flight,
      std: parseMinute(flight.std.minutes),
      aircraftRegister: flight.aircraftRegister!.name,
      blockTime: parseMinute(flight.blockTime),
      required: flight.required,
      freezed: flight.freezed,
      originPermission: flight.originPermission,
      destinationPermission: flight.destinationPermission,
      notes: flight.notes
    });
  }, []);
  const onOpenFlightPackModalMemoized = useCallback((flightPack: FlightPack) => {
    setEditFlightPackModalModel({
      ...editFlightPackModalModel,
      open: true,
      std: parseMinute(flightPack.start.minutes),
      aircraftRegister: flightPack.aircraftRegister && flightPack.aircraftRegister.name,
      required: flightPack.required,
      destinationPermission: flightPack.destinationPermission,
      freezed: flightPack.freezed,
      notes: flightPack.notes,
      originPermission: flightPack.originPermission,
      selectedFlightPack: flightPack
    });
  }, []);
  const onFlightPackDragAndDropMemoized = useCallback(async (flightPack: FlightPack, deltaStd: number, newAircraftRegister?: PreplanAircraftRegister) => {
    setResourceSchedulerViewModel(resourceSchedulerViewModel => ({ ...resourceSchedulerViewModel, loading: true }));
    preplan.stage({
      mergingFlightRequirementModels: flightPack.flights.map(f =>
        f.requirement.extractModel({
          days: {
            [f.requirement.days.findIndex(d => d.day === f.day)]: {
              flight: {
                std: f.std.minutes + deltaStd,
                aircraftRegisterId: newAircraftRegister && newAircraftRegister.id
              }
            }
          }
        })
      )
    });
    preplan.commit();
    const result = await PreplanService.editFlightRequirements(
      flightPack.flights.map(f =>
        f.requirement.extractModel({
          days: {
            [f.requirement.days.findIndex(d => d.day === f.day)]: {
              flight: {
                std: f.std.minutes + deltaStd,
                aircraftRegisterId: newAircraftRegister && newAircraftRegister.id
              }
            }
          }
        })
      )
    );
    result.message ? snackbar.enqueueSnackbar(result.message, { variant: 'error' }) : preplan.mergeFlightRequirements(...result.value!);
    setResourceSchedulerViewModel(resourceSchedulerViewModel => ({ ...resourceSchedulerViewModel, loading: false }));
  }, []);
  const onFlightPackMouseHoverMemoized = useCallback((flightPack: FlightPack) => setStatusBarProps({ mode: 'FLIGHT_PACK', flightPack }), []);
  const onFreeSpaceMouseHoverMemoized = useCallback(
    (aircraftRegister: PreplanAircraftRegister, previousFlightPack?: FlightPack, nextFlightPack?: FlightPack) =>
      setStatusBarProps({ mode: 'FREE_SPACE', aircraftRegister, previousFlightPack, nextFlightPack }),
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
          <span>00:01:23</span>
          <IconButton disabled={resourceSchedulerViewModel.loading} color="inherit" onClick={() => alert('Not implemented.')}>
            {true ? <MahanIcon type={MahanIconType.CheckBoxEmpty} title="Stop Auto Arrange" /> : <MahanIcon type={MahanIconType.UsingChlorine} title="Start Auto Arrange" />}
          </IconButton>
          <IconButton disabled={resourceSchedulerViewModel.loading} color="inherit" title="Finilize Preplan">
            <FinilizedIcon />
          </IconButton>
          <IconButton
            disabled={resourceSchedulerViewModel.loading}
            color="inherit"
            onClick={() => alert('Not implemented.')}
            title={allFlightsFreezed ? 'Unfreeze All Flights' : 'Freeze All Flights'}
          >
            {allFlightsFreezed ? <LockOpenIcon /> : <LockIcon />}
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
            onClick={() => setSideBarState({ ...sideBarState, sideBar: 'AUTO_ARRANGER_CHANGE_LOG', open: true })}
            title="Auto Arrange Change Log"
          >
            <MahanIcon type={MahanIconType.Change} />
          </IconButton>
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
          <IconButton
            disabled={resourceSchedulerViewModel.loading}
            color="inherit"
            onClick={() => setSideBarState({ ...sideBarState, sideBar: 'SETTINGS', open: true })}
            title="Settings"
          >
            <SettingsIcon />
          </IconButton>
        </div>
      </Portal>

      <Drawer
        anchor="right"
        open={sideBarState.open}
        onClose={() => setSideBarState({ ...sideBarState, open: false })}
        ModalProps={{ BackdropProps: { classes: { root: classes.sideBarBackdrop } } }}
        classes={{ paper: classes.sideBarPaper }}
      >
        {sideBarState.sideBar === 'SETTINGS' && <SettingsSideBar autoArrangerOptions={preplan.autoArrangerOptions} onApply={() => alert('TODO: Not implemented.')} />}
        {sideBarState.sideBar === 'SELECT_AIRCRAFT_REGISTERS' && (
          <SelectAircraftRegistersSideBar
            initialSearch={sideBarState.initialSearch}
            aircraftRegisters={preplan.aircraftRegisters}
            loading={sideBarState.loading}
            errorMessage={sideBarState.errorMessage}
            onApply={async (dummyAircraftRegisters, aircraftRegisterOptionsDictionary) => {
              setSideBarState(sideBarState => ({ ...sideBarState, loading: true, errorMessage: '' }));
              preplan.stage({ updatingAircraftRegisters: { dummyAircraftRegisters, aircraftRegisterOptionsDictionary } });
              preplan.commit();
              const result = await PreplanService.setAircraftRegisters(preplan.id, dummyAircraftRegisters, aircraftRegisterOptionsDictionary);
              result.message
                ? setSideBarState(sideBarState => ({ ...sideBarState, loading: false, errorMessage: result.message }))
                : setSideBarState(sideBarState => ({ ...sideBarState, loading: false, open: false }));
            }}
          />
        )}
        {sideBarState.sideBar === 'SEARCH_FLIGHTS' && (
          <SearchFlightsSideBar initialSearch={sideBarState.initialSearch} flights={preplan.flights} onClick={() => alert('not implemented.')} />
        )}
        {sideBarState.sideBar === 'AUTO_ARRANGER_CHANGE_LOG' && (
          <AutoArrangerChangeLogSideBar initialSearch={sideBarState.initialSearch} changeLogs={preplan.autoArrangerState.changeLogs} onClick={() => alert('not implemented.')} />
        )}
        {sideBarState.sideBar === 'OBJECTIONS' && <ObjectionsSideBar initialSearch={sideBarState.initialSearch} objections={preplan.constraintSystem.objections} />}
      </Drawer>

      <div className={resourceSchedulerViewModel.loading ? classes.disable : ''}>
        <ResourceSchedulerView
          startDate={preplan.startDate.getDatePart().addDays((preplan.startDate.getUTCDay() + 1) % 7)}
          readonly={false}
          flights={preplan.flights}
          flightPacks={preplan.flightPacks}
          aircraftRegisters={preplan.aircraftRegisters}
          changeLogs={preplan.autoArrangerState.changeLogs}
          selectedFlightPack={resourceSchedulerViewModel.selectedFlightPack}
          onSelectFlightPack={onSelectFlightPackMemoized}
          onFreezeFlightPack={onFreezeFlightPackMemoized}
          onRequireFlightPack={onRequireFlightPackMemoized}
          onIgnoreFlightPack={onIgnoreFlightPackMemoized}
          onOpenFlightModal={onOpenFlightModalMemoized}
          onOpenFlightPackModal={onOpenFlightPackModalMemoized}
          onFlightPackDragAndDrop={onFlightPackDragAndDropMemoized}
          onFlightPackMouseHover={onFlightPackMouseHoverMemoized}
          onFreeSpaceMouseHover={onFreeSpaceMouseHoverMemoized}
          onNowhereMouseHover={onNowhereMouseHoverMemoized}
        />
        <div className={classes.statusBarWrapper}>
          <StatusBar {...statusBarProps} />
        </div>
      </div>

      <SimpleModal
        key="ignore-flight-requirment-confirm-modal"
        title="Ignore flight requirment"
        open={confirmIgnoreFlightPackModalModel.open}
        loading={confirmIgnoreFlightPackModalModel.loading}
        errorMessage={confirmIgnoreFlightPackModalModel.errorMessage}
        cancelable={true}
        actions={[
          { title: 'No' },
          {
            title: 'Yes',
            action: async () => {
              setConfirmIgnoreFlightPackModalModel({ ...confirmIgnoreFlightPackModalModel, loading: true, errorMessage: undefined });

              const newFlightRequirementsModel = confirmIgnoreFlightPackModalModel!.selectedFlightPack!.flights.map(f => {
                return f.requirement.extractModel({
                  ignored: true
                });
              });

              //TODO: change included sp, get multi flightRequirments id
              preplan.stage({ mergingFlightRequirementModels: newFlightRequirementsModel });
              preplan.commit();
              const result = await PreplanService.editFlightRequirements(newFlightRequirementsModel);

              if (result.message) {
                snackbar.enqueueSnackbar(result.message, { variant: 'error' });
                setConfirmIgnoreFlightPackModalModel(ignoreFlightPackModalModel => ({ ...ignoreFlightPackModalModel, errorMessage: result.message, loading: false }));
              } else {
                preplan.mergeFlightRequirements(...result.value!);
                setConfirmIgnoreFlightPackModalModel(ignoreFlightPackModalModel => ({ ...ignoreFlightPackModalModel, loading: false, open: false }));
              }
            }
          }
        ]}
        onClose={() => setConfirmIgnoreFlightPackModalModel(ignoreFlightPackModalModel => ({ ...ignoreFlightPackModalModel, open: false }))}
      >
        [//TODO] Are you sure you want to ignore{' '}
        {resourceSchedulerViewModel.selectedFlightPack &&
          resourceSchedulerViewModel.selectedFlightPack.flights
            .map(n => n.label)
            .distinct()
            .join(', ')}
        ?
      </SimpleModal>

      <SimpleModal
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
      </SimpleModal>

      <SimpleModal
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
      </SimpleModal>
    </Fragment>
  );
};

export default ResourceSchedulerPage;
