import React, { FC, Fragment, useState, useContext, useCallback } from 'react';
import { Theme, IconButton, Badge, Drawer, Portal, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { DoneAll as FinilizedIcon, LockOutlined as LockIcon, LockOpenOutlined as LockOpenIcon, Search as SearchIcon, SettingsOutlined as SettingsIcon } from '@material-ui/icons';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import LinkIconButton from 'src/components/LinkIconButton';
import { NavBarToolsContainerContext, PreplanContext, ReloadPreplanContext } from 'src/pages/preplan';
import SearchFlightsSideBar from 'src/components/preplan/resource-scheduler/SearchFlightsSideBar';
import ObjectionsSideBar from 'src/components/preplan/resource-scheduler/ObjectionsSideBar';
import SelectAircraftRegistersSideBar from 'src/components/preplan/resource-scheduler/SelectAircraftRegistersSideBar';
import ResourceSchedulerView from 'src/components/preplan/resource-scheduler/ResourceSchedulerView';
import PreplanService from 'src/services/PreplanService';
import { useSnackbar } from 'notistack';
import PreplanAircraftRegister from 'src/business/preplan/PreplanAircraftRegister';
import { red, blue, green, cyan, indigo, orange, purple } from '@material-ui/core/colors';
import StatusBar, { StatusBarProps } from 'src/components/preplan/resource-scheduler/StatusBar';
import Flight from 'src/business/flight/Flight';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import Objectionable from 'src/business/constraints/Objectionable';
import FlightLeg from 'src/business/flight/FlightLeg';
import FlightService from 'src/services/FlightService';
import FlightModal, { useFlightModalState } from 'src/components/preplan/resource-scheduler/FlightModal';

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

  const [flightModalState, openFlightModal, closeFlightModal] = useFlightModalState();

  const snackbar = useSnackbar();

  const onSelectFlightMemoized = useCallback(
    (flight: Flight) => setResourceSchedulerViewModel(resourceSchedulerViewModel => ({ ...resourceSchedulerViewModel, selectedFlight: flight })),
    []
  );
  const onOpenFlightModalMemoized = useCallback((flight: Flight) => openFlightModal({ flight }), []);
  const onOpenFlightLegModalMemoized = useCallback((flightLeg: FlightLeg) => openFlightModal({ flight: flightLeg.flight, legIndex: flightLeg.index }), []);
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

      <FlightModal state={flightModalState} onClose={closeFlightModal} />
    </Fragment>
  );
};

export default ResourceSchedulerPage;
