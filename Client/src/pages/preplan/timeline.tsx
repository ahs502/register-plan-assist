import React, { FC, Fragment, useState, useContext, useEffect, useMemo } from 'react';
import { Theme, IconButton, Badge, Drawer, Portal, CircularProgress, Button } from '@material-ui/core';
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
import StatusBar, { StatusBarProps } from 'src/components/preplan/timeline/StatusBar';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import Objectionable from 'src/business/constraints/Objectionable';
import FlightService from 'src/services/FlightService';
import FlightLegModel from '@core/models/flight/FlightLegModel';
import FlightModel from '@core/models/flight/FlightModel';
import { dataTypes } from 'src/utils/DataType';
import DayFlightRequirementModel from '@core/models/flight-requirement/DayFlightRequirementModel';
import DayFlightRequirementLegModel from '@core/models/flight-requirement/DayFlightRequirementLegModel';
import FlightRequirementService from 'src/services/FlightRequirementService';
import KeyboardHandler from 'src/utils/KeyboardHandler';
import PerplanVersionsModal, { usePerplanVersionsModalState, PerplanVersionsModalState } from 'src/components/preplan/PerplanVersionsModal';
import SelectWeeks, { WeekSelection } from 'src/components/preplan/SelectWeeks';
import FlightView from 'src/business/flight/FlightView';
import Rsx from '@core/types/Rsx';
import Week from 'src/business/Week';
import Flight from 'src/business/flight/Flight';
import Weekday from '@core/types/Weekday';
import useProperty from 'src/utils/useProperty';

const useStyles = makeStyles((theme: Theme) => ({
  sideBarBackdrop: {
    backgroundColor: 'transparent'
  },
  sideBarPaper: {
    top: 105,
    height: 'calc(100% - 105px)'
  },
  selectWeekWrapper: {
    margin: 0,
    padding: 0,
    backgroundColor: theme.palette.common.white
  },
  statusBarWrapper: {
    // borderTop: `1px solid ${theme.palette.grey[300]}`,
    // height: 29,
    height: 30,
    margin: 0,
    padding: theme.spacing(0.4, 0, 0.5, 1),
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

interface NavBarStatus {
  preplanVersionDescription: string;
}
interface SideBarState {
  open: boolean;
  loading?: boolean;
  errorMessage?: string | undefined;
  sideBar?: SideBar;
  initialSearch?: string;
}

interface TimelineViewState {
  selectedFlightView?: FlightView;
  loading?: boolean;
}

export interface TimelinePageProps {
  onObjectionTargetClick(target: Objectionable): void;
  onEditFlightRequirement(flightRequirement: FlightRequirement): void;
  onEditDayFlightRequirement(dayFlightRequirement: DayFlightRequirement): void;
  onEditFlight(flightRequirement: FlightRequirement, day: Weekday, flights?: readonly Flight[]): void;
}

const TimelinePage: FC<TimelinePageProps> = ({ onObjectionTargetClick, onEditFlightRequirement, onEditDayFlightRequirement, onEditFlight: onEditFlightView }) => {
  //TODO: This should be the result of SettingsSideBar component:
  const settings: {
    readonly viewFilters: {
      readonly rsx: readonly Rsx[];
    };
    readonly viewOptions: {
      readonly extraDays: boolean;
      readonly numberOfExtraDays: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    };
  } = {
    viewFilters: {
      rsx: ['REAL', 'STB1']
    },
    viewOptions: {
      extraDays: true,
      numberOfExtraDays: 3
    }
  };

  const preplan = useContext(PreplanContext);
  const reloadPreplan = useContext(ReloadPreplanContext);

  const loadedPreplan = preplan.versions.find(v => v.id === preplan.id);
  const preplanVersionDescription = loadedPreplan?.current ? 'CURRENT' : `${loadedPreplan?.description} — ${loadedPreplan?.lastEditDateTime.format('FD')}`;
  const navBarStatus = {
    preplanVersionDescription: preplanVersionDescription
  };

  const [sideBarState, setSideBarState] = useState<SideBarState>({ open: false, loading: false, errorMessage: undefined });
  const [timelineViewState, setTimelineViewState] = useState<TimelineViewState>({ loading: false });
  const [weekSelection, setWeekSelection] = useState<WeekSelection>({
    previousStartIndex: 0,
    startIndex: 0,
    endIndex: preplan.weeks.all.length,
    nextEndIndex: preplan.weeks.all.length
  });
  const [statusBarProps, setStatusBarProps] = useState<StatusBarProps>({});

  const weekStart = preplan.weeks.all[weekSelection.startIndex];
  const weekEnd = preplan.weeks.all[weekSelection.endIndex - 1];
  const week = weekStart;
  const flightViews = useMemo<readonly FlightView[]>(() => preplan.getFlightViews(weekStart, weekEnd).filter(f => settings.viewFilters.rsx.includes(f.rsx)), [
    preplan,
    weekSelection.startIndex,
    weekSelection.endIndex
  ]);
  const previousWeekStart = preplan.weeks.all[weekSelection.previousStartIndex];
  const previousWeekEnd = preplan.weeks.all[weekSelection.previousStartIndex < weekSelection.startIndex ? weekSelection.startIndex - 1 : weekSelection.endIndex - 1];
  const previousWeek = new Week(week.startDate.clone().addDays(-7));
  const previousFlightViews = useMemo<readonly FlightView[]>(
    () => (!settings.viewOptions.extraDays ? [] : preplan.getFlightViews(previousWeekStart, previousWeekEnd, previousWeek).filter(f => settings.viewFilters.rsx.includes(f.rsx))),
    [preplan, ...Object.values(weekSelection), settings.viewOptions.extraDays]
  );
  const nextWeekStart = preplan.weeks.all[weekSelection.nextEndIndex > weekSelection.endIndex ? weekSelection.endIndex : weekSelection.startIndex];
  const nextWeekEnd = preplan.weeks.all[weekSelection.nextEndIndex - 1];
  const nextWeek = new Week(week.startDate.clone().addDays(7));
  const nextFlightViews = useMemo<readonly FlightView[]>(
    () => (!settings.viewOptions.extraDays ? [] : preplan.getFlightViews(nextWeekStart, nextWeekEnd, nextWeek).filter(f => settings.viewFilters.rsx.includes(f.rsx))),
    [preplan, ...Object.values(weekSelection), settings.viewOptions.extraDays]
  );

  const navBarToolsContainer = useContext(NavBarToolsContainerContext);

  useEffect(() => {
    const reference = KeyboardHandler.register({ alt: false, ctrl: true, shift: false }, 'Z', 'keydown', e => console.log('Ctrl+Z is pressed!', e));
    return () => KeyboardHandler.unregister(reference);
  }, []);

  const [preplanVersionsModalState, openPreplanVersionsModal, closePreplanVersionsModal] = usePerplanVersionsModalState();

  const snackbar = useSnackbar();
  const classes = useStyles();

  return (
    <Fragment>
      {timelineViewState.loading && <CircularProgress size={48} className={classes.progress} />}

      <Portal container={navBarToolsContainer}>
        <div className={timelineViewState.loading ? classes.disable : ''}>
          <Button onClick={() => openPreplanVersionsModal({ preplan: preplan } as PerplanVersionsModalState)}>{navBarStatus.preplanVersionDescription}</Button>
          <IconButton disabled={timelineViewState.loading} color="inherit" title="Accept Preplan">
            <FinilizedIcon />
          </IconButton>
          <LinkIconButton disabled={timelineViewState.loading} color="inherit" to={`/preplan/${preplan.id}/flight-requirement-list`} title="Flights">
            <MahanIcon type={MahanIconType.FlightIcon} />
          </LinkIconButton>
          <LinkIconButton disabled={timelineViewState.loading} color="inherit" title="Reports" to={`/preplan/${preplan.id}/reports`}>
            <MahanIcon type={MahanIconType.Chart} />
          </LinkIconButton>
          <IconButton
            disabled={timelineViewState.loading}
            color="inherit"
            onClick={() => setSideBarState({ ...sideBarState, sideBar: 'SEARCH_FLIGHTS', open: true })}
            title="Search Flight Legs"
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
            flightViews={flightViews}
            onClick={flightLegView => setTimelineViewState({ ...timelineViewState, selectedFlightView: flightLegView.flightView })}
          />
        )}
        {sideBarState.sideBar === 'OBJECTIONS' && <ObjectionsSideBar initialSearch={sideBarState.initialSearch} onClick={onObjectionTargetClick} />}
      </Drawer>

      <div className={timelineViewState.loading ? classes.disable : ''}>
        <div className={classes.selectWeekWrapper}>
          <SelectWeeks includeSides={true} weekSelection={weekSelection} onSelectWeeks={weekSelection => setWeekSelection(weekSelection)} />
        </div>
        <TimelineView
          week={week}
          flightViews={flightViews}
          previous={
            !settings.viewOptions.extraDays
              ? undefined
              : {
                  week: previousWeek,
                  numberOfDays: settings.viewOptions.numberOfExtraDays,
                  flightViews: previousFlightViews
                }
          }
          next={
            !settings.viewOptions.extraDays
              ? undefined
              : {
                  week: nextWeek,
                  numberOfDays: settings.viewOptions.numberOfExtraDays,
                  flightViews: nextFlightViews
                }
          }
          selectedFlightView={timelineViewState.selectedFlightView}
          onSelectFlightView={flightView => setTimelineViewState({ ...timelineViewState, selectedFlightView: flightView })}
          onEditFlightRequirement={onEditFlightRequirement}
          onEditDayFlightRequirement={onEditDayFlightRequirement}
          onEditFlight={onEditFlightView}
          onFlightViewDragAndDrop={async (flightView, deltaStd, newAircraftRegister, allWeekdays) => {
            setTimelineViewState({ ...timelineViewState, loading: true });
            try {
              const flightModels: FlightModel[] = preplan.flights
                .filter(f => f.flightRequirement.id === flightView.flightRequirement.id)
                .map(f =>
                  flightView.flights.includes(f) || allWeekdays
                    ? f.extractModel(flightModel => ({
                        ...flightModel,
                        aircraftRegisterId:
                          newAircraftRegister?.id !== flightView.aircraftRegister?.id || f.day === flightView.day
                            ? dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).convertBusinessToModelOptional(newAircraftRegister)
                            : flightModel.aircraftRegisterId,
                        legs: flightModel.legs.map<FlightLegModel>(l => ({
                          ...l,
                          std: l.std + deltaStd
                        }))
                      }))
                    : f.extractModel()
                );
              // const newPreplanModel = await FlightService.edit(preplan.id, ...flightModels);
              const newFlightRequirementModel = flightView.flightRequirement.extractModel(flightRequirementModel => ({
                ...flightRequirementModel,
                days: flightRequirementModel.days.map<DayFlightRequirementModel>(d =>
                  d.day === flightView.day || allWeekdays
                    ? {
                        ...d,
                        route: d.route.map<DayFlightRequirementLegModel>(l => ({
                          ...l,
                          stdLowerBound: l.stdLowerBound + deltaStd,
                          stdUpperBound: undefined
                        }))
                      }
                    : d
                )
              }));
              const newPreplanModel = await FlightRequirementService.edit(preplan.id, newFlightRequirementModel, flightModels);
              await reloadPreplan(newPreplanModel);
            } catch (reason) {
              snackbar.enqueueSnackbar(String(reason), { variant: 'error' });
              await reloadPreplan();
            }
            setTimelineViewState(timelineViewState => ({ ...timelineViewState, loading: false }));
          }}
          onFlightViewMouseHover={flightView => setStatusBarProps({ mode: 'FLIGHT_VIEW', flightView })}
          onFreeSpaceMouseHover={(aircraftRegister, previousFlightView, nextFlightView) =>
            setStatusBarProps({ mode: 'FREE_SPACE', aircraftRegister, previousFlightView, nextFlightView })
          }
          onNowhereMouseHover={() => setStatusBarProps({})}
        />
        <div className={classes.statusBarWrapper}>
          <StatusBar {...statusBarProps} />
        </div>
      </div>

      <PerplanVersionsModal state={preplanVersionsModalState} onClose={closePreplanVersionsModal} />
    </Fragment>
  );
};

export default TimelinePage;
