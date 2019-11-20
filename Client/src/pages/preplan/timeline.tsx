import React, { FC, Fragment, useState, useContext, useCallback } from 'react';
import { Theme, IconButton, Badge, Drawer, Portal, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { DoneAll as FinilizedIcon, Search as SearchIcon, SettingsOutlined as SettingsIcon } from '@material-ui/icons';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import LinkIconButton from 'src/components/LinkIconButton';
import { NavBarToolsContainerContext, PreplanContext, ReloadPreplanContext } from 'src/pages/preplan';
import SearchFlightsSideBar from 'src/components/preplan/timeline/SearchFlightsSideBar';
import ObjectionsSideBar from 'src/components/preplan/timeline/ObjectionsSideBar';
import SelectAircraftRegistersSideBar from 'src/components/preplan/timeline/SelectAircraftRegistersSideBar';
import TimelineView from 'src/components/preplan/timeline/TimelineView';
import PreplanService from 'src/services/PreplanService';
import { useSnackbar } from 'notistack';
import PreplanAircraftRegister from 'src/business/preplan/PreplanAircraftRegister';
import StatusBar, { StatusBarProps } from 'src/components/preplan/timeline/StatusBar';
import Flight from 'src/business/flight/Flight';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import Objectionable from 'src/business/constraints/Objectionable';
import FlightService from 'src/services/FlightService';
import FlightLegModel from '@core/models/flight/FlightLegModel';
import FlightModel from '@core/models/flight/FlightModel';
import { formFields } from 'src/utils/FormField';

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

interface TimelineViewState {
  selectedFlight?: Flight;
  loading?: boolean;
}

export interface TimelinePageProps {
  onObjectionTargetClick(target: Objectionable): void;
  onEditFlightRequirement(flightRequirement: FlightRequirement): void;
  onEditDayFlightRequirement(dayFlightRequirement: DayFlightRequirement): void;
  onEditFlight(flight: Flight): void;
}

const TimelinePage: FC<TimelinePageProps> = ({ onObjectionTargetClick, onEditFlightRequirement, onEditDayFlightRequirement, onEditFlight }) => {
  const preplan = useContext(PreplanContext);
  const reloadPreplan = useContext(ReloadPreplanContext);

  const [sideBarState, setSideBarState] = useState<SideBarState>({ open: false, loading: false, errorMessage: undefined });
  const [timelineViewState, setTimelineViewState] = useState<TimelineViewState>({ loading: false });
  const [statusBarProps, setStatusBarProps] = useState<StatusBarProps>({});

  const snackbar = useSnackbar();

  const onSelectFlightMemoized = useCallback((flight: Flight) => setTimelineViewState(timelineViewModel => ({ ...timelineViewModel, selectedFlight: flight })), []);
  const onEditFlightMemoized = useCallback(onEditFlight, []);
  const onFlightDragAndDropMemoized = useCallback(
    async (flight: Flight, deltaStd: number, newAircraftRegister?: PreplanAircraftRegister) => {
      setTimelineViewState(timelineViewModel => ({ ...timelineViewModel, loading: true }));
      try {
        const flightModel: FlightModel = {
          id: flight.id,
          flightRequirementId: flight.flightRequirement.id,
          day: flight.day,
          aircraftRegisterId: newAircraftRegister ? newAircraftRegister.id : undefined,
          legs: flight.legs.map<FlightLegModel>(l => ({
            std: l.std.minutes + deltaStd
          }))
        };

        const otherFlightModels: FlightModel[] = preplan.flights
          .filter(f => f.flightRequirement.id === flight.flightRequirement.id && f.id !== flight.id)
          .map<FlightModel>(f => ({
            id: f.id,
            flightRequirementId: f.flightRequirement.id,
            day: f.day,
            aircraftRegisterId:
              f.aircraftRegister === undefined
                ? undefined
                : formFields.preplanAircraftRegister(preplan.aircraftRegisters).parse(formFields.preplanAircraftRegister(preplan.aircraftRegisters).format(f.aircraftRegister)),
            legs: f.legs.map<FlightLegModel>(l => ({
              std: formFields.daytime.parse(formFields.daytime.format(l.std))
            }))
          }));

        const newPreplanModel = await FlightService.edit(preplan.id, flightModel, ...otherFlightModels);
        await reloadPreplan(newPreplanModel);
      } catch (reason) {
        snackbar.enqueueSnackbar(String(reason), { variant: 'error' });
        await reloadPreplan();
      }
      setTimelineViewState(timelineViewModel => ({ ...timelineViewModel, loading: false }));
    },
    [preplan]
  );
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
      {timelineViewState.loading && <CircularProgress size={48} className={classes.progress} />}

      <Portal container={navBarToolsContainer}>
        <div className={timelineViewState.loading ? classes.disable : ''}>
          <IconButton disabled={timelineViewState.loading} color="inherit" title="Finilize Preplan">
            <FinilizedIcon />
          </IconButton>
          <LinkIconButton disabled={timelineViewState.loading} color="inherit" to={`/preplan/${preplan.id}/flight-requirement-list`} title="Flight Requirments">
            <MahanIcon type={MahanIconType.FlightIcon} />
          </LinkIconButton>
          <LinkIconButton disabled={timelineViewState.loading} color="inherit" title="Reports" to={`/preplan/${preplan.id}/reports`}>
            <MahanIcon type={MahanIconType.Chart} />
          </LinkIconButton>
          <IconButton
            disabled={timelineViewState.loading}
            color="inherit"
            onClick={() => setSideBarState({ ...sideBarState, sideBar: 'SEARCH_FLIGHTS', open: true })}
            title="Search Flights"
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            disabled={timelineViewState.loading}
            color="inherit"
            onClick={() => setSideBarState({ ...sideBarState, sideBar: 'OBJECTIONS', open: true })}
            title="Errors and Warnings"
          >
            <Badge badgeContent={preplan.constraintSystem.objections.length} color="secondary" invisible={preplan.constraintSystem.objections.length === 0}>
              <MahanIcon type={MahanIconType.Alert} fontSize="inherit" />
            </Badge>
          </IconButton>
          <IconButton
            disabled={timelineViewState.loading}
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
            onClick={flightLeg => setTimelineViewState({ ...timelineViewState, selectedFlight: flightLeg.flight })}
          />
        )}
        {sideBarState.sideBar === 'OBJECTIONS' && <ObjectionsSideBar initialSearch={sideBarState.initialSearch} onClick={onObjectionTargetClick} />}
      </Drawer>

      <div className={timelineViewState.loading ? classes.disable : ''}>
        <TimelineView
          selectedFlight={timelineViewState.selectedFlight}
          onSelectFlight={onSelectFlightMemoized}
          onEditFlight={onEditFlightMemoized}
          onFlightDragAndDrop={onFlightDragAndDropMemoized}
          onFlightMouseHover={onFlightMouseHoverMemoized}
          onFreeSpaceMouseHover={onFreeSpaceMouseHoverMemoized}
          onNowhereMouseHover={onNowhereMouseHoverMemoized}
        />
        <div className={classes.statusBarWrapper}>
          <StatusBar {...statusBarProps} />
        </div>
      </div>
    </Fragment>
  );
};

export default TimelinePage;
