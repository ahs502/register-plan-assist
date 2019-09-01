import React, { FC, Fragment, useState, useContext, useCallback } from 'react';
import { Theme, IconButton, Badge, Drawer, Portal, CircularProgress, Typography, Grid, TextField, Checkbox, FormControlLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { DoneAll as FinilizedIcon, LockOutlined as LockIcon, LockOpenOutlined as LockOpenIcon, Search as SearchIcon, SettingsOutlined as SettingsIcon } from '@material-ui/icons';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import LinkIconButton from 'src/components/LinkIconButton';
import { NavBarToolsContainerContext } from 'src/pages/preplan';
import AutoArrangerChangeLogSideBar from 'src/components/preplan/resource-scheduler/AutoArrangerChangeLogSideBar';
import SearchFlightsSideBar from 'src/components/preplan/resource-scheduler/SearchFlightsSideBar';
import ErrorsAndWarningsSideBar from 'src/components/preplan/resource-scheduler/ErrorsAndWarningsSideBar';
import SelectAircraftRegistersSideBar from 'src/components/preplan/resource-scheduler/SelectAircraftRegistersSideBar';
import SettingsSideBar from 'src/components/preplan/resource-scheduler/SettingsSideBar';
import ResourceSchedulerView from 'src/components/preplan/resource-scheduler/ResourceSchedulerView';
import Preplan from 'src/view-models/Preplan';
import FlightRequirement from 'src/view-models/flights/FlightRequirement';
import WeekdayFlightRequirement from 'src/view-models/flights/WeekdayFlightRequirement';
import Flight from 'src/view-models/flights/Flight';
import FlightPack from 'src/view-models/flights/FlightPack';
import PreplanService from 'src/services/PreplanService';
import { useSnackbar, VariantType } from 'notistack';
import PreplanAircraftRegister from 'src/view-models/PreplanAircraftRegister';
import SimpleModal from 'src/components/SimpleModal';
import Weekday from '@core/types/Weekday';
import { red, blue, green, cyan, indigo, orange, purple } from '@material-ui/core/colors';
import { parseMinute, parseHHMM } from 'src/utils/model-parsers';
import MasterData from '@core/master-data';
import { async } from 'q';

const useStyles = makeStyles((theme: Theme) => ({
  sideBarBackdrop: {
    backgroundColor: 'transparent'
  },
  sideBarPaper: {
    top: 105,
    height: 'calc(100% - 105px)'
  },
  statusBar: {
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
  onEditFlight(flight: Flight): void;
  onEditFlightRequirement(flightRequirement: FlightRequirement): void;
  onEditWeekdayFlightRequirement(weekdayFlightRequirement: WeekdayFlightRequirement): void;
}

interface SidebarState {
  open: boolean;
  loading?: boolean;
  errorMessage?: string | undefined;
  sideBar?: SideBar;
  initialSearch?: string;
}

const ResourceSchedulerPage: FC<ResourceSchedulerPageProps> = ({ preplan }) => {
  const [sidebarState, setSidebarState] = useState<SidebarState>({ open: false, loading: false, errorMessage: undefined });
  const [autoArrangerRunning, setAutoArrangerRunning] = useState(() => false); //TODO: Initialize by data from server.
  const [allFlightsFreezed, setAllFlightsFreezed] = useState(() => false); //TODO: Initialize from preplan flights.
  const [resourceSchedulerViewModel, setResourceSchedulerViewModel] = useState<ResourceSchedulerViewModel>({ loading: false });
  const [statusBarText, setStatusBarText] = useState('');
  const [confirmIgnoreFlightPackModalModel, setConfirmIgnoreFlightPackModalModel] = useState<ConfirmIgnoreFlightPackModalModel>({ open: false });
  const [editFlightModalModel, setEditFlightModalModel] = useState<EditFlightModalModel>({ open: false });
  const [editFlightPackModalModel, setEditFlightPackModalModel] = useState<EditFlightPackModalModel>({ open: false });

  const navBarToolsContainer = useContext(NavBarToolsContainerContext);

  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const numberOfObjections: number = 12; //TODO: Not implemented.

  function snackbar(message: string, variant: VariantType) {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar(message, { variant });
  }

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
          {/*
            <Select
            classes={{ select: classes.formDaysSelect }}
            native
            value={this.state.numberOfDays}
            onChange={this.handleChangeDays}
            id="outlined-age-native-simple"
            input={<OutlinedInput labelWidth={0} />}
            title="Zoom Level"
          >
            <option value={1}>One Day</option>
            <option value={2}>Two Days</option>
            <option value={3}>Three Days</option>
            <option value={7}>Seven Days</option>
            <option value={8}>Eight Days</option>
          </Select>
          */}
          <IconButton
            disabled={resourceSchedulerViewModel.loading}
            color="inherit"
            onClick={() => setSidebarState({ ...sidebarState, sideBar: 'AUTO_ARRANGER_CHANGE_LOG', open: true })}
            title="Auto Arrange Change Log"
          >
            <MahanIcon type={MahanIconType.Change} />
          </IconButton>
          <IconButton
            disabled={resourceSchedulerViewModel.loading}
            color="inherit"
            onClick={() => setSidebarState({ ...sidebarState, sideBar: 'SEARCH_FLIGHTS', open: true })}
            title="Search Flights"
          >
            <SearchIcon />
          </IconButton>

          <IconButton
            disabled={resourceSchedulerViewModel.loading}
            color="inherit"
            onClick={() => setSidebarState({ ...sidebarState, sideBar: 'OBJECTIONS', open: true })}
            title="Errors and Warnings"
          >
            <Badge badgeContent={numberOfObjections} color="secondary" invisible={!numberOfObjections}>
              <MahanIcon type={MahanIconType.Alert} fontSize="inherit" />
            </Badge>
          </IconButton>

          <IconButton
            disabled={resourceSchedulerViewModel.loading}
            color="inherit"
            onClick={() => setSidebarState({ ...sidebarState, sideBar: 'SELECT_AIRCRAFT_REGISTERS', open: true })}
            title="Select Aircraft Register"
          >
            <MahanIcon type={MahanIconType.Flights} />
          </IconButton>
          <IconButton
            disabled={resourceSchedulerViewModel.loading}
            color="inherit"
            onClick={() => setSidebarState({ ...sidebarState, sideBar: 'SETTINGS', open: true })}
            title="Settings"
          >
            <SettingsIcon />
          </IconButton>
        </div>
      </Portal>

      <Drawer
        anchor="right"
        open={sidebarState.open}
        onClose={() => setSidebarState({ ...sidebarState, open: false })}
        ModalProps={{ BackdropProps: { classes: { root: classes.sideBarBackdrop } } }}
        classes={{ paper: classes.sideBarPaper }}
      >
        {sidebarState.sideBar === 'SETTINGS' && <SettingsSideBar autoArrangerOptions={preplan.autoArrangerOptions} onApply={() => alert('TODO: Not implemented.')} />}
        {sidebarState.sideBar === 'SELECT_AIRCRAFT_REGISTERS' && (
          <SelectAircraftRegistersSideBar
            initialSearch={sidebarState.initialSearch}
            aircraftRegisters={preplan.aircraftRegisters}
            loading={sidebarState.loading}
            errorMessage={sidebarState.errorMessage}
            onApply={async (dummyAircraftRegisters, aircraftRegisterOptionsDictionary) => {
              setSidebarState({ ...sidebarState, loading: true, errorMessage: '' });
              const result = await PreplanService.setAircraftRegisters(preplan.id, dummyAircraftRegisters, aircraftRegisterOptionsDictionary);

              if (result.message) {
                setSidebarState(sidebarState => ({ ...sidebarState, loading: false, errorMessage: result.message }));
              } else {
                setSidebarState(sidebarState => ({ ...sidebarState, loading: false, open: false }));
              }
            }}
          />
        )}
        {sidebarState.sideBar === 'SEARCH_FLIGHTS' && (
          <SearchFlightsSideBar initialSearch={sidebarState.initialSearch} flights={preplan.flights} onClick={() => alert('not implemented.')} />
        )}
        {sidebarState.sideBar === 'AUTO_ARRANGER_CHANGE_LOG' && (
          <AutoArrangerChangeLogSideBar initialSearch={sidebarState.initialSearch} changeLogs={preplan.autoArrangerState.changeLogs} onClick={() => alert('not implemented.')} />
        )}
        {sidebarState.sideBar === 'OBJECTIONS' && <ErrorsAndWarningsSideBar initialSearch={sidebarState.initialSearch} objections={[]} />}
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
          onSelectFlightPack={flightPack => setResourceSchedulerViewModel({ ...resourceSchedulerViewModel, selectedFlightPack: flightPack })}
          onFreezeFlightPack={async (flightPack, freezed) => {
            setResourceSchedulerViewModel({ ...resourceSchedulerViewModel, loading: true });
            const newFlightRequirementsModel = flightPack.flights.map(f => {
              return f.requirement.extractModel({
                days: {
                  [f.requirement.days.findIndex(d => d.day === f.day)]: { freezed }
                }
              });
            });
            const result = await PreplanService.editFlightRequirements(newFlightRequirementsModel);

            if (result.message) {
              snackbar(result.message, 'error');
            } else {
              preplan.mergeFlightRequirements(...result.value!.map(f => new FlightRequirement(f, preplan.aircraftRegisters)));
            }

            setResourceSchedulerViewModel({ ...resourceSchedulerViewModel, loading: false });
          }}
          onRequireFlightPack={async (flightPack, required) => {
            setResourceSchedulerViewModel({ ...resourceSchedulerViewModel, loading: true });

            const newFlightRequirementsModel = flightPack.flights.map(f => {
              return f.requirement.extractModel({
                days: {
                  [f.requirement.days.findIndex(d => d.day === f.day)]: { scope: { required } }
                }
              });
            });

            const result = await PreplanService.editFlightRequirements(newFlightRequirementsModel);

            if (result.message) {
              snackbar(result.message, 'error');
            } else {
              preplan.mergeFlightRequirements(...result.value!.map(f => new FlightRequirement(f, preplan.aircraftRegisters)));
            }

            setResourceSchedulerViewModel({ ...resourceSchedulerViewModel, loading: false });
          }}
          onIgnoreFlightPack={async flightPack => {
            //setResourceSchedulerViewModel({ ...resourceSchedulerViewModel, selectedFlightPack: flightPack, ignoreFlightPack: true, errorMessage: undefined });
            setConfirmIgnoreFlightPackModalModel({ ...confirmIgnoreFlightPackModalModel, open: true });
          }}
          onOpenFlightModal={flight => {
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
          }}
          onOpenFlightPackModal={flightPack => {
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
          }}
          onFlightPackDragAndDrop={async (flightPack, deltaStd, newAircraftRegister) => {
            setResourceSchedulerViewModel({ ...resourceSchedulerViewModel, loading: true });

            const newFlightRequirementsModel = flightPack.flights.map(f => {
              return f.requirement.extractModel({
                days: {
                  [f.requirement.days.findIndex(d => d.day === f.day)]: {
                    flight: {
                      std: f.std.minutes + deltaStd,
                      aircraftRegisterId: newAircraftRegister && newAircraftRegister.id
                    }
                  }
                }
              });
            });

            const result = await PreplanService.editFlightRequirements(newFlightRequirementsModel);

            if (result.message) {
              snackbar(result.message, 'error');
            } else {
              preplan.mergeFlightRequirements(...result.value!.map(f => new FlightRequirement(f, preplan.aircraftRegisters)));
            }

            setResourceSchedulerViewModel({ ...resourceSchedulerViewModel, loading: false });
          }}
          // onFlightPackMouseHover={flightPack => setStatusBarText(flightPack.label)}
          // onFreeSpaceMouseHover={(aircraftRegister, previousFlightPack, nextFlightPack) => setStatusBarText(aircraftRegister ? aircraftRegister.name : '???')}
          // onNowhereMouseHover={() => setStatusBarText('')}
          onFlightPackMouseHover={flightPack => console.log(flightPack.label)}
          onFreeSpaceMouseHover={(aircraftRegister, previousFlightPack, nextFlightPack) => console.log(aircraftRegister ? aircraftRegister.name : '???')}
          onNowhereMouseHover={() => console.log('')}
        />
        <div className={classes.statusBar}>{statusBarText}</div>
      </div>

      <SimpleModal
        key="ignore-flight-requirment-confirm-modal"
        title="Ignore flight requirment"
        open={confirmIgnoreFlightPackModalModel.open}
        loading={confirmIgnoreFlightPackModalModel.loading}
        errorMessage={confirmIgnoreFlightPackModalModel.errorMessage}
        actions={[
          { title: 'No' },
          {
            title: 'Yes',
            action: async () => {
              setConfirmIgnoreFlightPackModalModel({ ...confirmIgnoreFlightPackModalModel, loading: true, errorMessage: undefined });

              const newFlightRequirementsModel = resourceSchedulerViewModel!.selectedFlightPack!.flights.map(f => {
                return f.requirement.extractModel({
                  ignored: true
                });
              });

              //TODO: change included sp, get multi flightRequirments id
              const result = await PreplanService.editFlightRequirements(newFlightRequirementsModel);

              if (result.message) {
                snackbar(result.message, 'error');
                setConfirmIgnoreFlightPackModalModel(ignoreFlightPackModalModel => ({ ...ignoreFlightPackModalModel, errorMessage: result.message, loading: false }));
              } else {
                newFlightRequirementsModel.forEach(f => preplan.removeFlightRequirement(f.id!));
                setConfirmIgnoreFlightPackModalModel(ignoreFlightPackModalModel => ({ ...ignoreFlightPackModalModel, loading: false, open: false }));
              }
            }
          }
        ]}
        onClose={() => setConfirmIgnoreFlightPackModalModel(ignoreFlightPackModalModel => ({ ...ignoreFlightPackModalModel, open: false }))}
      >
        Are you sure you want to ignore{' '}
        {resourceSchedulerViewModel.selectedFlightPack &&
          resourceSchedulerViewModel.selectedFlightPack.flights
            .map(n => n.label)
            .distinct()
            .join(',')}
        ?
      </SimpleModal>

      <SimpleModal
        key="edit-flight-pack-modal"
        title={'Flight pack ' + (editFlightPackModalModel.selectedFlightPack && editFlightPackModalModel.selectedFlightPack.label)}
        open={editFlightPackModalModel.open}
        loading={editFlightPackModalModel.loading}
        errorMessage={editFlightPackModalModel.errorMessage}
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
              const models = sortedFlights.map(n => {
                return n.requirement.extractModel({
                  days: {
                    [n.requirement.days.findIndex(d => d.day === n.day)]: {
                      scope: {
                        required: editFlightPackModalModel.required,
                        destinationPermission: editFlightPackModalModel.destinationPermission,
                        originPermission: editFlightPackModalModel.originPermission
                      },
                      flight: {
                        std: n.std.minutes + delta,
                        aircraftRegisterId: register && register.id
                      },
                      freezed: editFlightPackModalModel.freezed,
                      notes: editFlightPackModalModel.notes
                    }
                  }
                });
              });

              const result = await PreplanService.editFlightRequirements(models);

              if (result.message) {
                setEditFlightPackModalModel(openFlightPackModalModel => ({ ...openFlightPackModalModel, loading: false, errorMessage: result.message }));
              } else {
                setEditFlightPackModalModel(openFlightPackModalModel => ({ ...openFlightPackModalModel, loading: false, open: false, errorMessage: undefined }));
                preplan.mergeFlightRequirements(...result.value!.map(n => new FlightRequirement(n, preplan.aircraftRegisters)));
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
                  checked={editFlightPackModalModel.required}
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
                  checked={editFlightPackModalModel.freezed}
                  onChange={e => setEditFlightPackModalModel({ ...editFlightPackModalModel, freezed: e.target.checked })}
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
                  checked={editFlightPackModalModel.destinationPermission}
                  onChange={e => setEditFlightPackModalModel({ ...editFlightPackModalModel, destinationPermission: e.target.checked })}
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
                  checked={editFlightPackModalModel.originPermission}
                  onChange={e => setEditFlightPackModalModel({ ...editFlightPackModalModel, originPermission: e.target.checked })}
                />
              }
            />
          </Grid>
          <Grid xs={12}>
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
        actions={[
          { title: 'Close' },
          { title: 'Objections' },
          { title: 'Flight Requirment' },
          { title: 'Weekday Flight Requirment' },
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
              const result = await PreplanService.editFlightRequirements([model]);

              if (result.message) {
                setEditFlightModalModel(openFlightModalModel => ({ ...openFlightModalModel, loading: false, errorMessage: result.message }));
              } else {
                setEditFlightModalModel(openFlightModalModel => ({ ...openFlightModalModel, loading: false, open: false, errorMessage: undefined }));
                preplan.mergeFlightRequirements(new FlightRequirement(result.value![0], preplan.aircraftRegisters));
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
          <Grid xs={12}>
            <TextField fullWidth label="Notes" value={editFlightModalModel.notes} onChange={s => setEditFlightModalModel({ ...editFlightModalModel, notes: s.target.value })} />
          </Grid>
        </Grid>
      </SimpleModal>
    </Fragment>
  );
};

export default ResourceSchedulerPage;
