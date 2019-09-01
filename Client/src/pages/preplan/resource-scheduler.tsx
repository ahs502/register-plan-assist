import React, { FC, Fragment as div, useState, useContext, useEffect, Fragment } from 'react';
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
import Daytime from '@core/types/Daytime';
import FlightPack from 'src/view-models/flights/FlightPack';
import PreplanService from 'src/services/PreplanService';
import { FlightScopeModel } from '@core/models/flights/FlightScopeModel';
import FlightTimeModel from '@core/models/flights/FlightTimeModel';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';
import FlightRequirementModel from '@core/models/flights/FlightRequirementModel';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';
import { useSnackbar, VariantType } from 'notistack';
import SimpleModal from 'src/components/SimpleModal';
import Weekday from '@core/types/Weekday';
import { red, blue, green, cyan, indigo, orange, purple } from '@material-ui/core/colors';
import { parseMinute, parseHHMM } from 'src/utils/model-parsers';
import MasterData from '@core/master-data';

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
    backgroundColor: theme.palette.extraColors.backupRegister,
    margin: 0,
    padding: theme.spacing(2)
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

interface IgnoreFlightPackModalModel {
  open: boolean;
  selectedFlightPack?: FlightPack;
  loading?: boolean;
  errorMessage?: string;
}

interface OpenFlightModalModel {
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

interface OpenFlightPackModalModel {
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
  const [] = useState(() => false); //TODO: Initialize by data from server.
  const [allFlightsFreezed] = useState(() => false); //TODO: Initialize from preplan flights.
  const [resourceSchedulerViewModel, setResourceSchedulerViewModel] = useState<ResourceSchedulerViewModel>({ loading: false });
  const [ignoreFlightPackModalModel, setIgnoreFlightPackModalModel] = useState<IgnoreFlightPackModalModel>({ open: false });
  const [openFlightModalModel, setOpenFlightModalModel] = useState<OpenFlightModalModel>({ open: false });
  const [openFlightPackModalModel, setOpenFlightPackModalModel] = useState<OpenFlightPackModalModel>({ open: false });
  const [sidebarState, setSidebarState] = useState<SidebarState>({ open: false, loading: false, errorMessage: undefined });
  const [statusBarText] = useState('');

  const navBarToolsContainer = useContext(NavBarToolsContainerContext);

  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const numberOfObjections: number = 12; //TODO: Not implemented.

  function snackbar(message: string, variant: VariantType) {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar(message, { variant });
  }

  useEffect(() => {
    console.log(sidebarState);
  }, [sidebarState]);

  return (
    <div>
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
            setIgnoreFlightPackModalModel({ ...ignoreFlightPackModalModel, open: true });
          }}
          onOpenFlightModal={flight => {
            setOpenFlightModalModel({
              ...openFlightModalModel,
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
            setOpenFlightPackModalModel({
              ...openFlightPackModalModel,
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
          onFlightPackMouseHover={() => {
            // console.log('flight pack', flightPack);
            //TODO: Not implemented.
          }}
          onFreeSpaceMouseHover={() => {
            // console.log('free space', aircraftRegister, previousFlightPack, nextFlightPack);
            //TODO: Not implemented.
          }}
          onNowhereMouseHover={() => {
            // console.log('nowhere');
            //TODO: Not implemented.
          }}
        />
      </div>
      <div className={classes.statusBar}>{statusBarText}</div>

      <SimpleModal
        key="ignore-flight-requirment-confirm-modal"
        title="Ignore flight requirment"
        open={ignoreFlightPackModalModel.open}
        loading={ignoreFlightPackModalModel.loading}
        errorMessage={ignoreFlightPackModalModel.errorMessage}
        actions={[
          { title: 'No' },
          {
            title: 'Yes',
            action: async () => {
              setIgnoreFlightPackModalModel({ ...ignoreFlightPackModalModel, loading: true, errorMessage: undefined });

              const newFlightRequirementsModel = resourceSchedulerViewModel!.selectedFlightPack!.flights.map(f => {
                return f.requirement.extractModel({
                  ignored: true
                });
              });

              //TODO: change included sp, get multi flightRequirments id
              const result = await PreplanService.editFlightRequirements(newFlightRequirementsModel);

              if (result.message) {
                snackbar(result.message, 'error');
                setIgnoreFlightPackModalModel(ignoreFlightPackModalModel => ({ ...ignoreFlightPackModalModel, errorMessage: result.message, loading: false }));
              } else {
                newFlightRequirementsModel.forEach(f => preplan.removeFlightRequirement(f.id!));
                setIgnoreFlightPackModalModel(ignoreFlightPackModalModel => ({ ...ignoreFlightPackModalModel, loading: false, open: false }));
              }
            }
          }
        ]}
        onClose={() => setIgnoreFlightPackModalModel(ignoreFlightPackModalModel => ({ ...ignoreFlightPackModalModel, open: false }))}
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
        title="Edit flight pack"
        open={openFlightPackModalModel.open}
        actions={[{ title: 'Cancle' }, { title: 'Edit' }]}
        onClose={() => setOpenFlightPackModalModel({ ...openFlightPackModalModel, open: false })}
      >
        Edit Flight Pack
      </SimpleModal>

      <SimpleModal
        key="edit-flight-modal"
        title=""
        complexTitle={
          openFlightModalModel.flight && (
            <Fragment>
              Flight
              <span className={classes.openflightModalLabel}> {openFlightModalModel.flight.label} </span>
              <span className={classes.openflightModalFlightNumber}>{openFlightModalModel.flight.flightNumber} </span>
              <span className={classes.openflightModalAirports}>
                {openFlightModalModel.flight.departureAirport.name}-{openFlightModalModel.flight.arrivalAirport.name}{' '}
              </span>
              <span className={classes.openflightModalWeekDay}>{Weekday[openFlightModalModel.flight.day]}s </span>
              <span className={classes.openflightModalStc}>{openFlightModalModel.flight.stc.name} </span>
              {<span className={classes.openflightModalRsx}>{openFlightModalModel.flight.rsx} </span>}
              <span className={classes.openflightModalCategory}>{openFlightModalModel.flight.category} </span>
            </Fragment>
          )
        }
        loading={openFlightModalModel.loading}
        errorMessage={openFlightModalModel.errorMessage}
        open={openFlightModalModel.open}
        actions={[
          { title: 'Close' },
          { title: 'Objections' },
          { title: 'Flight Requirment' },
          { title: 'Weekday Flight Requirment' },
          {
            title: 'Apply',
            action: async () => {
              setOpenFlightModalModel({ ...openFlightModalModel, loading: true, errorMessage: undefined });
              const flightRequirment = openFlightModalModel.flight!.requirement;
              const register = MasterData.all.aircraftRegisters.items.find(n => n.name.toUpperCase() === (openFlightModalModel.aircraftRegister || '').toUpperCase());
              const model = flightRequirment.extractModel({
                days: {
                  [flightRequirment.days.findIndex(d => d.day === openFlightModalModel.flight!.day)]: {
                    scope: {
                      blockTime: parseHHMM(openFlightModalModel.blockTime),
                      required: openFlightModalModel.required,
                      destinationPermission: openFlightModalModel.destinationPermission,
                      originPermission: openFlightModalModel.originPermission
                    },
                    flight: {
                      std: parseHHMM(openFlightModalModel.std),
                      aircraftRegisterId: register && register.id
                    },
                    freezed: openFlightModalModel.freezed,
                    notes: openFlightModalModel.notes
                  }
                }
              });
              const result = await PreplanService.editFlightRequirements([model]);

              if (result.message) {
                setOpenFlightModalModel(openFlightModalModel => ({ ...openFlightModalModel, loading: false, errorMessage: result.message }));
              } else {
                setOpenFlightModalModel(openFlightModalModel => ({ ...openFlightModalModel, loading: false, open: false, errorMessage: undefined }));
                preplan.mergeFlightRequirements(new FlightRequirement(result.value![0], preplan.aircraftRegisters));
              }
            }
          }
        ]}
        onClose={() => setOpenFlightModalModel({ ...openFlightModalModel, open: false })}
      >
        <Grid container>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="STD"
              value={openFlightModalModel.std}
              onChange={s => {
                setOpenFlightModalModel({ ...openFlightModalModel, std: s.target.value });
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Block Time"
              value={openFlightModalModel.blockTime}
              onChange={s => {
                setOpenFlightModalModel({ ...openFlightModalModel, blockTime: s.target.value });
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Aircraft Register"
              value={openFlightModalModel.aircraftRegister}
              onChange={s => {
                setOpenFlightModalModel({ ...openFlightModalModel, aircraftRegister: s.target.value });
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              label="Required"
              control={
                <Checkbox
                  color="primary"
                  checked={openFlightModalModel.required}
                  onChange={e => setOpenFlightModalModel({ ...openFlightModalModel, required: e.target.checked })}
                />
              }
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              label="Freezed"
              control={
                <Checkbox color="primary" checked={openFlightModalModel.freezed} onChange={e => setOpenFlightModalModel({ ...openFlightModalModel, freezed: e.target.checked })} />
              }
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              label="Destination Permission"
              control={
                <Checkbox
                  color="primary"
                  checked={openFlightModalModel.destinationPermission}
                  onChange={e => setOpenFlightModalModel({ ...openFlightModalModel, destinationPermission: e.target.checked })}
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
                  checked={openFlightModalModel.originPermission}
                  onChange={e => setOpenFlightModalModel({ ...openFlightModalModel, originPermission: e.target.checked })}
                />
              }
            />
          </Grid>
          <Grid xs={12}>
            <TextField fullWidth label="Notes" value={openFlightModalModel.notes} onChange={s => setOpenFlightModalModel({ ...openFlightModalModel, notes: s.target.value })} />
          </Grid>
        </Grid>
      </SimpleModal>
    </div>
  );
};

export default ResourceSchedulerPage;
