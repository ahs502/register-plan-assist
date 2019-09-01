import React, { FC, Fragment, useState, useContext, useCallback } from 'react';
import { Theme, IconButton, Badge, Drawer, Portal } from '@material-ui/core';
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
  }
}));

type SideBar = 'SETTINGS' | 'SELECT_AIRCRAFT_REGISTERS' | 'SEARCH_FLIGHTS' | 'AUTO_ARRANGER_CHANGE_LOG' | 'OBJECTIONS';

interface ResourceSchedulerViewModel {
  selectedFlightPack?: FlightPack;
  loading?: boolean;
}

export interface ResourceSchedulerPageProps {
  preplan: Preplan;
  onEditFlight(flight: Flight): void;
  onEditFlightRequirement(flightRequirement: FlightRequirement): void;
  onEditWeekdayFlightRequirement(weekdayFlightRequirement: WeekdayFlightRequirement): void;
}

interface SidebarState {
  loading: boolean;
  errorMessage: string | undefined;
}

const ResourceSchedulerPage: FC<ResourceSchedulerPageProps> = ({ preplan }) => {
  const [sideBar, setSideBar] = useState<{ sideBar?: SideBar; open: boolean; initialSearch?: string }>({ open: false });
  const [autoArrangerRunning, setAutoArrangerRunning] = useState(() => false); //TODO: Initialize by data from server.
  const [allFlightsFreezed, setAllFlightsFreezed] = useState(() => false); //TODO: Initialize from preplan flights.
  const [resourceSchedulerViewModel, setResourceSchedulerViewModel] = useState<ResourceSchedulerViewModel>({});
  const [sidebarState, setSidebarState] = useState<SidebarState>({ loading: false, errorMessage: undefined });
  const [statusBarText, setStatusBarText] = useState('');

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
      <Portal container={navBarToolsContainer}>
        <Fragment>
          <span>00:01:23</span>
          <IconButton color="inherit" onClick={() => alert('Not implemented.')}>
            {true ? <MahanIcon type={MahanIconType.CheckBoxEmpty} title="Stop Auto Arrange" /> : <MahanIcon type={MahanIconType.UsingChlorine} title="Start Auto Arrange" />}
          </IconButton>
          <IconButton color="inherit" title="Finilize Preplan">
            <FinilizedIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => alert('Not implemented.')} title={allFlightsFreezed ? 'Unfreeze All Flights' : 'Freeze All Flights'}>
            {allFlightsFreezed ? <LockOpenIcon /> : <LockIcon />}
          </IconButton>
          <LinkIconButton color="inherit" to={`/preplan/${preplan.id}/flight-requirement-list`} title="Flight Requirments">
            <MahanIcon type={MahanIconType.FlightIcon} />
          </LinkIconButton>
          <LinkIconButton color="inherit" title="Reports" to={`/preplan/${preplan.id}/reports`}>
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
          <IconButton color="inherit" onClick={() => setSideBar({ sideBar: 'AUTO_ARRANGER_CHANGE_LOG', open: true })} title="Auto Arrange Change Log">
            <MahanIcon type={MahanIconType.Change} />
          </IconButton>
          <IconButton color="inherit" onClick={() => setSideBar({ sideBar: 'SEARCH_FLIGHTS', open: true })} title="Search Flights">
            <SearchIcon />
          </IconButton>

          <IconButton color="inherit" onClick={() => setSideBar({ sideBar: 'OBJECTIONS', open: true })} title="Errors and Warnings">
            <Badge badgeContent={numberOfObjections} color="secondary" invisible={!numberOfObjections}>
              <MahanIcon type={MahanIconType.Alert} fontSize="inherit" />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={() => setSideBar({ sideBar: 'SELECT_AIRCRAFT_REGISTERS', open: true })} title="Select Aircraft Register">
            <MahanIcon type={MahanIconType.Flights} />
          </IconButton>
          <IconButton color="inherit" onClick={() => setSideBar({ sideBar: 'SETTINGS', open: true })} title="Settings">
            <SettingsIcon />
          </IconButton>
        </Fragment>
      </Portal>

      <Drawer
        anchor="right"
        open={sideBar.open}
        onClose={() => setSideBar({ open: false })}
        ModalProps={{ BackdropProps: { classes: { root: classes.sideBarBackdrop } } }}
        classes={{ paper: classes.sideBarPaper }}
      >
        {sideBar.sideBar === 'SETTINGS' && <SettingsSideBar autoArrangerOptions={preplan.autoArrangerOptions} onApply={() => alert('TODO: Not implemented.')} />}
        {sideBar.sideBar === 'SELECT_AIRCRAFT_REGISTERS' && (
          <SelectAircraftRegistersSideBar
            initialSearch={sideBar.initialSearch}
            aircraftRegisters={preplan.aircraftRegisters}
            loading={sidebarState.loading}
            errorMessage={sidebarState.errorMessage}
            onApply={async (dummyAircraftRegisters, aircraftRegisterOptionsDictionary) => {
              setSidebarState({ loading: true, errorMessage: undefined });
              const result = await PreplanService.setAircraftRegisters(preplan.id, dummyAircraftRegisters, aircraftRegisterOptionsDictionary);
              setSidebarState({ loading: false, errorMessage: result.message });
            }}
          />
        )}
        {sideBar.sideBar === 'SEARCH_FLIGHTS' && <SearchFlightsSideBar initialSearch={sideBar.initialSearch} flights={preplan.flights} onClick={() => alert('not implemented.')} />}
        {sideBar.sideBar === 'AUTO_ARRANGER_CHANGE_LOG' && (
          <AutoArrangerChangeLogSideBar initialSearch={sideBar.initialSearch} changeLogs={preplan.autoArrangerState.changeLogs} onClick={() => alert('not implemented.')} />
        )}
        {sideBar.sideBar === 'OBJECTIONS' && <ErrorsAndWarningsSideBar initialSearch={sideBar.initialSearch} objections={[]} />}
      </Drawer>

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
          setResourceSchedulerViewModel({ ...resourceSchedulerViewModel, loading: true });

          const newFlightRequirementsModel = flightPack.flights.map(f => {
            return f.requirement.extractModel({
              ignored: true
            });
          });

          //TODO: change included sp, get multi flightRequirments id
          const result = await PreplanService.editFlightRequirements(newFlightRequirementsModel);

          if (result.message) {
            snackbar(result.message, 'error');
          } else {
            newFlightRequirementsModel.forEach(f => preplan.removeFlightRequirement(f.id!));
          }

          setResourceSchedulerViewModel({ ...resourceSchedulerViewModel, loading: false });
        }}
        onOpenFlightModal={() => {
          //TODO: Not implemented.
        }}
        onOpenFlightPackModal={() => {
          //TODO: Not implemented.
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
    </Fragment>
  );
};

export default ResourceSchedulerPage;
