import React, { FC, Fragment, useState, useEffect, useRef, createContext, useCallback } from 'react';
import { Theme, TextField, Fab, Grid, Typography, IconButton, FormControlLabel, Checkbox } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import useRouter from 'src/utils/useRouter';
import NavBar from 'src/components/NavBar';
import ResourceSchedulerPage from 'src/pages/preplan/resource-scheduler';
import FlightRequirementListPage from 'src/pages/preplan/flight-requirement-list';
import ReportsPage from 'src/pages/preplan/reports';
import Preplan from 'src/view-models/Preplan';
import PreplanAircraftIdentity from 'src/view-models/PreplanAircraftIdentity';
import MasterData, { Stc } from '@core/master-data';
import FlightRequirement from 'src/view-models/flights/FlightRequirement';
import AircraftIdentityType from '@core/types/aircraft-identity/AircraftIdentityType';
import PreplanService from 'src/services/PreplanService';
import FlightRequirementModel, { FlightRequirementValidation } from '@core/models/flights/FlightRequirementModel';
import FlightTimeModel from '@core/models/flights/FlightTimeModel';
import { parseAirport, parseHHMM, parseMinute } from 'src/utils/model-parsers';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';
import { FlightScopeModel } from '@core/models/flights/FlightScopeModel';
import SimpleModal from 'src/components/SimpleModal';
import AutoComplete from 'src/components/AutoComplete';
import DaysPicker from 'src/components/DaysPicker';
import { Clear as ClearIcon, Add as AddIcon } from '@material-ui/icons';
import Rsx, { Rsxes } from '@core/types/flight-requirement/Rsx';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';
import ServerResult from '@core/types/ServerResult';
import MultiSelect from 'src/components/MultiSelect';
import PreplanAircraftSelection from 'src/view-models/PreplanAircraftSelection';
import FlightModel from '@core/models/flights/FlightModel';
import WeekdayFlightRequirement from 'src/view-models/flights/WeekdayFlightRequirement';

const useStyles = makeStyles((theme: Theme) => ({
  flightRequirementStyle: {
    height: 830
  },
  root: {
    position: 'relative'
  },
  timesFieldSet: {
    borderColor: theme.palette.grey[50],
    borderRadius: 6
  },
  times: {
    overflow: 'auto',
    maxHeight: 168
  },
  gridStyle: {
    matgin: theme.spacing(0, 0, 2, 0)
  },
  captionTextColor: {
    color: theme.palette.grey[500]
  },
  fab: {
    margin: theme.spacing(1),
    position: 'absolute',
    left: 470,
    top: 213
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  disable: {
    opacity: 0.5
  }
}));

export const NavBarToolsContainerContext = createContext<HTMLDivElement | null>(null);

export interface FlightRequirementModalModel {
  open: boolean;
  loading: boolean;
  errorMessage?: string;
  flightRequirement?: FlightRequirement;
  weekly?: boolean;
  day?: number;
  days?: boolean[];
  unavailableDays?: boolean[];
  label?: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  blockTime?: string;
  times?: { stdLowerBound: string; stdUpperBound: string }[];
  allowedAircraftIdentities?: AircraftIdentity[];
  forbiddenAircraftIdentities?: AircraftIdentity[];
  originPermission?: boolean;
  destinationPermission?: boolean;
  notes?: string;
  required?: boolean;
  rsx?: Rsx;
  stc?: Stc;
  category?: string;
  mode?: modeType;
  actionTitle?: string;
  disable?: boolean;
}

const flightRequirmentTitleMessage = {
  add: 'What is the new flight requierment?',
  edit: 'Edit flight requierment',
  readOnly: 'Flight requierment',
  return: 'What is the return flight requierment?',
  remove: 'Would you like to delete flight requirement?'
};

const rsxes = Rsxes.map(r => {
  return { name: r };
});

type modeType = 'add' | 'edit' | 'readOnly' | 'return' | 'remove';

interface AircraftIdentity {
  id: string;
  masterDataId: string;
  name: string;
  type: AircraftIdentityType;
}

const PreplanPage: FC = () => {
  const [preplan, setPreplan] = useState<Preplan | null>(null);
  const [showContents, setShowContents] = useState(false);
  const [flightRequirementModalModel, setFlightRequirementModalModel] = useState<FlightRequirementModalModel>({ open: false, loading: false });
  const [flightRequirements, setFlightRequirements] = useState<readonly FlightRequirement[]>();
  const navBarToolsRef = useRef<HTMLDivElement>(null);

  const classes = useStyles();
  const { match } = useRouter<{ id: string }>();

  const registerIdentities: AircraftIdentity[] = preplan
    ? preplan.aircraftRegisters.items.map((a, index) => ({ masterDataId: a.id, name: a.name, type: 'REGISTER', id: index + 'register' } as AircraftIdentity))
    : [];
  const groupIdentities: AircraftIdentity[] = MasterData.all.aircraftGroups.items.map(
    (a, index) => ({ masterDataId: a.id, name: a.name, type: 'GROUP', id: index + 'group' } as AircraftIdentity)
  );
  const typeIdentities: AircraftIdentity[] = MasterData.all.aircraftTypes.items.flatMap((a, index) => {
    return [
      {
        masterDataId: a.id,
        name: a.name,
        type: 'TYPE',
        id: index + 'type'
      } as AircraftIdentity,
      {
        masterDataId: a.id,
        name: a.name + '_DUMMY',
        type: 'TYPE_DUMMY',
        id: index + 'type_dummy'
      } as AircraftIdentity,
      {
        masterDataId: a.id,
        name: a.name + '_EXISTING',
        type: 'TYPE_EXISTING',
        id: index + 'type_existing'
      } as AircraftIdentity
    ];
  });

  const aircraftIdentities: AircraftIdentity[] = registerIdentities.concat(groupIdentities).concat(typeIdentities);

  useEffect(() => {
    //TODO: Load preplan by match.params.id from server if not loaded yet.
    //TODO: Go back to preplan list when not succeeded:
    // history.push('/preplan-list');

    !preplan &&
      PreplanService.get(match.params.id).then(p => {
        if (p.message) {
        } else {
          const preplan = new Preplan(p.value!);
          setFlightRequirements(preplan.flightRequirements);
          setPreplan(preplan);
        }
      });
  }, []);

  useEffect(() => setShowContents(true), []);

  const resourceSchedulerPageSelected = window.location.href.startsWith(`${window.location.host}/#${match.url}/resource-scheduler`);
  const flightRequirementListPageSelected = window.location.href.startsWith(`${window.location.host}/#${match.url}/flight-requirement-list`);
  const reportsPageSelected = window.location.href.startsWith(`${window.location.host}/#${match.url}/reports`);

  function initializeFlightRequirementModalModel(mode: modeType, flightRequirement?: FlightRequirement, weekdayFlightRequirement?: WeekdayFlightRequirement) {
    const modalModel: FlightRequirementModalModel = {
      open: false,
      loading: false,
      actionTitle: mode === 'add' || mode === 'return' ? 'Add' : 'Edit',
      mode: mode,
      rsx: 'REAL',
      times: [],
      stc: MasterData.all.stcs.items.find(n => n.name === 'J'),
      flightRequirement: {} as FlightRequirement
    };

    modalModel.times!.push({} as { stdLowerBound: string; stdUpperBound: string });

    if (!flightRequirement) return modalModel;

    const days = Array.range(0, 6).map(() => false);
    flightRequirement.days.map(d => d.day).forEach(n => (days[n] = true));

    const allowedIdentities = weekdayFlightRequirement
      ? weekdayFlightRequirement.scope.aircraftSelection.allowedIdentities
      : flightRequirement.scope.aircraftSelection.allowedIdentities;
    const forbiddenIdentities = weekdayFlightRequirement
      ? weekdayFlightRequirement.scope.aircraftSelection.forbiddenIdentities
      : flightRequirement.scope.aircraftSelection.forbiddenIdentities;
    modalModel.flightRequirement = flightRequirement;
    modalModel.days = days;
    modalModel.allowedAircraftIdentities = convertePreplanAircraftIdentityToAircraftIdentity(allowedIdentities, aircraftIdentities);
    modalModel.forbiddenAircraftIdentities = convertePreplanAircraftIdentityToAircraftIdentity(forbiddenIdentities, aircraftIdentities);
    modalModel.arrivalAirport = mode !== 'return' ? flightRequirement.definition.arrivalAirport.name : flightRequirement.definition.departureAirport.name;
    modalModel.departureAirport = mode !== 'return' ? flightRequirement.definition.departureAirport.name : flightRequirement.definition.arrivalAirport.name;
    modalModel.blockTime = weekdayFlightRequirement ? parseMinute(weekdayFlightRequirement.scope.blockTime) : parseMinute(flightRequirement.scope.blockTime);
    modalModel.category = flightRequirement.definition.category;
    modalModel.destinationPermission = weekdayFlightRequirement ? weekdayFlightRequirement.scope.destinationPermission : flightRequirement.scope.destinationPermission;
    modalModel.flightNumber = flightRequirement.definition.flightNumber;
    modalModel.label = flightRequirement.definition.label;
    modalModel.notes = weekdayFlightRequirement && weekdayFlightRequirement.notes;
    modalModel.weekly = !weekdayFlightRequirement;
    modalModel.originPermission = weekdayFlightRequirement ? weekdayFlightRequirement.scope.originPermission : flightRequirement.scope.originPermission;
    modalModel.required = weekdayFlightRequirement ? weekdayFlightRequirement.scope.required : flightRequirement.scope.required;
    modalModel.rsx = weekdayFlightRequirement ? weekdayFlightRequirement.scope.rsx : flightRequirement.scope.rsx;
    modalModel.stc = flightRequirement.definition.stc;
    modalModel.times = (weekdayFlightRequirement ? weekdayFlightRequirement.scope.times : flightRequirement.scope.times).map(t => ({
      stdLowerBound: parseMinute(t.stdLowerBound.minutes + (mode === 'return' ? 120 : 0)),
      stdUpperBound: parseMinute(t.stdUpperBound.minutes + (mode === 'return' ? 120 : 0))
    }));
    modalModel.day = weekdayFlightRequirement && weekdayFlightRequirement.day;
    //modalModel.unavailableDays =
    return modalModel;
  }

  function convertePreplanAircraftIdentityToAircraftIdentity(preplanAircraftIdentities: readonly PreplanAircraftIdentity[], aircraftIdentities: AircraftIdentity[]) {
    return preplanAircraftIdentities.map(n => aircraftIdentities.find(a => a.masterDataId === n.entity.id && a.type === n.type)!);
  }

  return (
    <Fragment>
      <NavBar
        backLink={resourceSchedulerPageSelected ? '/preplan-list' : match.url}
        backTitle={resourceSchedulerPageSelected ? 'Back to Pre Plan List' : `Back to Pre Plan ${preplan && preplan.name}`}
        navBarLinks={[
          {
            title: 'Pre Plans',
            link: '/preplan-list'
          },
          preplan && {
            title: preplan.name,
            link: match.url
          },
          flightRequirementListPageSelected && {
            title: 'Flight Requirements',
            link: `${match.url}/flight-requirement-list`
          },
          reportsPageSelected && {
            title: 'Reports',
            link: `${match.url}/reports`
          },
          reportsPageSelected &&
            window.location.hash.endsWith('/proposal') && {
              title: 'Proposal Report',
              link: `${match.url}/reports/proposal`
            },
          reportsPageSelected &&
            window.location.hash.endsWith('/connections') && {
              title: 'Connections Report',
              link: `${match.url}/reports/connections`
            }
        ]}
      >
        <div ref={navBarToolsRef} />
      </NavBar>
      {showContents && preplan && (
        <NavBarToolsContainerContext.Provider value={navBarToolsRef.current}>
          <Switch>
            <Redirect exact from={match.url} to={match.url + '/resource-scheduler'} />
            <Route
              exact
              path={match.path + '/resource-scheduler'}
              component={() => (
                <ResourceSchedulerPage
                  preplan={preplan}
                  onEditFlight={f => alert('edit flight ' + f.derivedId)}
                  onEditFlightRequirement={f => {
                    const modalModel = initializeFlightRequirementModalModel('edit', f);
                    modalModel.open = true;
                    setFlightRequirementModalModel(modalModel);
                  }}
                  onEditWeekdayFlightRequirement={(f, weekdayFlightRequirement) => {
                    const modalModel = initializeFlightRequirementModalModel('edit', f, weekdayFlightRequirement);
                    modalModel.open = true;
                    setFlightRequirementModalModel(modalModel);
                  }}
                />
              )}
            />
            <Route
              exact
              path={match.path + '/flight-requirement-list'}
              render={() => {
                return (
                  <FlightRequirementListPage
                    flightRequirements={flightRequirements!}
                    preplan={preplan}
                    onAddFlightRequirement={() => {
                      const modalModel = initializeFlightRequirementModalModel('add');
                      modalModel.open = true;
                      setFlightRequirementModalModel(modalModel);
                    }}
                    onRemoveFlightRequirement={f => {
                      const modalModel = initializeFlightRequirementModalModel('remove', f);
                      modalModel.open = true;
                      setFlightRequirementModalModel(modalModel);
                    }}
                    onEditFlightRequirement={f => {
                      const modalModel = initializeFlightRequirementModalModel('edit', f);
                      modalModel.open = true;
                      setFlightRequirementModalModel(modalModel);
                    }}
                    onAddReturnFlightRequirement={f => {
                      const modalModel = initializeFlightRequirementModalModel('return', f);
                      modalModel.open = true;
                      setFlightRequirementModalModel(modalModel);
                    }}
                    onRemoveWeekdayFlightRequirement={(weekday, fr) => {
                      const modalModel = initializeFlightRequirementModalModel('remove', fr, weekday);
                      modalModel.open = true;
                      setFlightRequirementModalModel(modalModel);
                    }}
                    onEditWeekdayFlightRequirement={(weekday, fr) => {
                      const modalModel = initializeFlightRequirementModalModel('edit', fr, weekday);
                      modalModel.open = true;
                      setFlightRequirementModalModel(modalModel);
                    }}
                  />
                );
              }}
            />
            <Route exact path={match.path + '/reports/:report?'} component={() => <ReportsPage preplan={preplan} />} />
            <Redirect to={match.url} />
          </Switch>
        </NavBarToolsContainerContext.Provider>
      )}

      <SimpleModal
        key="flightRequirementEditor"
        title={flightRequirmentTitleMessage[flightRequirementModalModel.mode!]}
        open={
          flightRequirementModalModel.open &&
          (flightRequirementModalModel.mode === 'add' || flightRequirementModalModel.mode === 'edit' || flightRequirementModalModel.mode === 'return')
        }
        loading={flightRequirementModalModel.loading}
        errorMessage={flightRequirementModalModel.errorMessage}
        cancelable={true}
        onClose={() => setFlightRequirementModalModel({ ...flightRequirementModalModel, open: false })}
        actions={[
          {
            title: 'Cancel'
          },
          {
            title: flightRequirementModalModel.actionTitle!,
            action: async () => {
              if (flightRequirementModalModel.mode === 'add' || flightRequirementModalModel.mode === 'return') await addOrEditWeeklyFlightRequirment(flightRequirementModalModel);
              if (flightRequirementModalModel.mode === 'edit' && flightRequirementModalModel.weekly) await addOrEditWeeklyFlightRequirment(flightRequirementModalModel);
              if (flightRequirementModalModel.mode === 'edit' && !flightRequirementModalModel.weekly) await editDailyFlightRequirment(flightRequirementModalModel);

              async function addOrEditWeeklyFlightRequirment(fr: FlightRequirementModalModel) {
                setFlightRequirementModalModel({ ...fr, loading: true, errorMessage: undefined });

                const scope: FlightScopeModel = {
                  blockTime: parseHHMM(fr.blockTime),
                  times: fr.times!.map(t => {
                    return { stdLowerBound: parseHHMM(t.stdLowerBound), stdUpperBound: parseHHMM(t.stdUpperBound) } as FlightTimeModel;
                  }),
                  destinationPermission: !!fr.destinationPermission,
                  originPermission: !!fr.originPermission,
                  required: !!fr.required,
                  rsx: fr.rsx!,
                  aircraftSelection: {
                    allowedIdentities: fr.allowedAircraftIdentities
                      ? fr.allowedAircraftIdentities.map(a => ({ entityId: a.masterDataId, type: a.type } as AircraftIdentityModel))
                      : [],
                    forbiddenIdentities: fr.forbiddenAircraftIdentities
                      ? fr.forbiddenAircraftIdentities.map(a => ({ entityId: a.masterDataId, type: a.type } as AircraftIdentityModel))
                      : []
                  }
                };

                const aircraftRegister = new PreplanAircraftSelection(scope.aircraftSelection, preplan!.aircraftRegisters).resolveIncluded()[0];

                const model: FlightRequirementModel = {
                  id: flightRequirementModalModel.mode === 'edit' ? fr.flightRequirement!.id : undefined,
                  definition: {
                    label: (fr.label || '').toUpperCase(),
                    category: fr.category || '',
                    stcId: fr.stc ? fr.stc.id : '',
                    flightNumber: (fr.flightNumber || '').toUpperCase(),
                    departureAirportId: parseAirport(fr.departureAirport)!,
                    arrivalAirportId: parseAirport(fr.arrivalAirport)!
                  },
                  scope: scope,
                  days: fr
                    .days!.map((e, i) => (e ? i : ''))
                    .filter(String)
                    .map(d => {
                      let flight: FlightModel;
                      if (flightRequirementModalModel.mode === 'add') {
                        flight = {
                          std: scope.times[0].stdLowerBound,
                          aircraftRegisterId: aircraftRegister && aircraftRegister.id
                        };
                      } else {
                        const flight = flightRequirementModalModel.flightRequirement!.days.find(m => m.day === d)!.flight;
                      }

                      return {
                        day: d,
                        notes: fr.notes,
                        scope: scope,
                        freezed: false,
                        flight: {
                          std: scope.times[0].stdLowerBound,
                          aircraftRegisterId: aircraftRegister && aircraftRegister.id
                        }
                      } as WeekdayFlightRequirementModel;
                    }),
                  ignored: false
                };

                const validation = new FlightRequirementValidation(model, preplan!.aircraftRegisters.items.map(a => a.id));
                if (!validation.ok) {
                  setFlightRequirementModalModel({ ...fr, loading: false });
                  return;
                }

                let result: FlightRequirementModel | undefined;
                let resultMessage: string | undefined;
                if (model.id) {
                  const response = await PreplanService.editFlightRequirements([model]);
                  result = response.value && response.value[0];
                  resultMessage = response.message;
                } else {
                  const response = await PreplanService.addFlightRequirement(preplan!.id, model);
                  result = response.value;
                  resultMessage = response.message;
                }

                if (resultMessage) {
                  setFlightRequirementModalModel({ ...fr, loading: false, errorMessage: resultMessage });
                } else {
                  setFlightRequirementModalModel({ ...fr, loading: false, open: false });
                  preplan!.mergeFlightRequirements(new FlightRequirement(result!, preplan!.aircraftRegisters));
                  setFlightRequirements([...preplan!.flightRequirements]);
                }
              }

              async function editDailyFlightRequirment(weekfr: FlightRequirementModalModel) {
                const weekDayScope: FlightScopeModel = {
                  blockTime: parseHHMM(weekfr.blockTime),
                  times: weekfr.times!.map(t => {
                    return { stdLowerBound: parseHHMM(t.stdLowerBound), stdUpperBound: parseHHMM(t.stdUpperBound) } as FlightTimeModel;
                  }),
                  destinationPermission: !!weekfr.destinationPermission,
                  originPermission: !!weekfr.originPermission,
                  required: !!weekfr.required,
                  rsx: weekfr.rsx!,
                  aircraftSelection: {
                    allowedIdentities: weekfr.allowedAircraftIdentities
                      ? weekfr.allowedAircraftIdentities.map(a => ({ entityId: a.masterDataId, type: a.type } as AircraftIdentityModel))
                      : [],
                    forbiddenIdentities: weekfr.forbiddenAircraftIdentities
                      ? weekfr.forbiddenAircraftIdentities.map(a => ({ entityId: a.masterDataId, type: a.type } as AircraftIdentityModel))
                      : []
                  }
                };

                const flightRequirment = weekfr.flightRequirement!;
                const frScope: FlightScopeModel = {
                  blockTime: flightRequirment.scope.blockTime,
                  times: flightRequirment.scope.times!.map(t => {
                    return { stdLowerBound: t.stdLowerBound.minutes, stdUpperBound: t.stdUpperBound.minutes } as FlightTimeModel;
                  }),
                  destinationPermission: !!flightRequirment.scope.destinationPermission,
                  originPermission: !!flightRequirment.scope.originPermission,
                  required: !!flightRequirment.scope.required,
                  rsx: flightRequirment.scope.rsx!,
                  aircraftSelection: {
                    allowedIdentities: flightRequirment.scope.aircraftSelection.allowedIdentities
                      ? flightRequirment.scope.aircraftSelection.allowedIdentities.map(a => ({ entityId: a.entity && a.entity!.id, type: a.type } as AircraftIdentityModel))
                      : [],
                    forbiddenIdentities: flightRequirment.scope.aircraftSelection.forbiddenIdentities
                      ? flightRequirment.scope.aircraftSelection.forbiddenIdentities.map(a => ({ entityId: a.entity && a.entity!.id, type: a.type } as AircraftIdentityModel))
                      : []
                  }
                };

                const days = weekfr
                  .flightRequirement!.days!.filter(d => d.day !== weekfr.day!)
                  .map(w => {
                    const result: WeekdayFlightRequirementModel = {
                      day: w.day,
                      flight: {
                        std: w.flight.std.minutes,
                        aircraftRegisterId: w.flight.aircraftRegister && w.flight.aircraftRegister.id
                      },
                      freezed: w.freezed,
                      notes: w.notes,
                      scope: {
                        aircraftSelection: {
                          allowedIdentities: w.scope.aircraftSelection.allowedIdentities
                            ? w.scope.aircraftSelection.allowedIdentities.map(a => ({ entityId: a.entity.id, type: a.type } as AircraftIdentityModel))
                            : [],
                          forbiddenIdentities: w.scope.aircraftSelection.forbiddenIdentities
                            ? w.scope.aircraftSelection.forbiddenIdentities.map(a => ({ entityId: a.entity.id, type: a.type } as AircraftIdentityModel))
                            : []
                        },
                        blockTime: w.scope.blockTime,
                        destinationPermission: w.scope.destinationPermission,
                        originPermission: w.scope.originPermission,
                        required: w.scope.required,
                        rsx: w.scope.rsx,
                        times: w.scope.times.map(t => ({ stdLowerBound: t.stdLowerBound.minutes, stdUpperBound: t.stdUpperBound.minutes } as FlightTimeModel))
                      }
                    };
                    return result;
                  });

                const aircraftRegister = new PreplanAircraftSelection(weekDayScope.aircraftSelection, preplan!.aircraftRegisters).resolveIncluded()[0];

                const day: WeekdayFlightRequirementModel = {
                  day: weekfr.day!,
                  flight: {
                    std: weekDayScope.times[0].stdLowerBound,
                    aircraftRegisterId: aircraftRegister && aircraftRegister.id
                  },
                  freezed: false,
                  notes: weekfr.notes || '',
                  scope: weekDayScope
                };

                days.push(day);
                const model: FlightRequirementModel = {
                  id: weekfr.flightRequirement!.id,
                  definition: {
                    label: (weekfr.label || '').toUpperCase(),
                    category: weekfr.category || '',
                    stcId: weekfr.stc ? weekfr.stc.id : '',
                    flightNumber: (weekfr.flightNumber || '').toUpperCase(),
                    departureAirportId: parseAirport(weekfr.departureAirport)!,
                    arrivalAirportId: parseAirport(weekfr.arrivalAirport)!
                  },
                  scope: frScope,
                  days: days,
                  ignored: false
                };

                const validation = new FlightRequirementValidation(model, preplan!.aircraftRegisters.items.map(a => a.id));
                if (!validation.ok) {
                  setFlightRequirementModalModel({ ...weekfr, loading: false });
                  return;
                }

                const result = await PreplanService.editFlightRequirements([model]);

                if (result.message) {
                  setFlightRequirementModalModel({ ...weekfr, loading: false, errorMessage: result.message });
                } else {
                  setFlightRequirementModalModel({ ...weekfr, loading: false, open: false });
                  preplan!.mergeFlightRequirements(new FlightRequirement(result.value![0], preplan!.aircraftRegisters));
                  setFlightRequirements([...preplan!.flightRequirements]);
                }
              }
            }
          }
        ]}
      >
        <div className={classes.root}>
          <Fab
            size="small"
            aria-label="add"
            className={classes.fab}
            onClick={() => {
              // var temp = { ...flightRequirement };
              // temp.times = temp.times && [...temp.times];
              // temp.times && temp.times.push({} as FlightTime);
              // setFlightRequirement(temp);
              flightRequirementModalModel.times!.push({} as { stdLowerBound: string; stdUpperBound: string });
              setFlightRequirementModalModel({ ...flightRequirementModalModel });
            }}
          >
            <AddIcon />
          </Fab>

          <div>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography variant="caption" className={classes.captionTextColor}>
                      Flight Information
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Label"
                      value={flightRequirementModalModel.label || ''}
                      onChange={l => setFlightRequirementModalModel({ ...flightRequirementModalModel, label: l.target.value })}
                      disabled={(!flightRequirementModalModel.weekly && flightRequirementModalModel.mode !== 'add') || flightRequirementModalModel.disable}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    {/* <InputLabel htmlFor="rsx">RSX</InputLabel> */}
                    <AutoComplete
                      label="RSX"
                      options={rsxes}
                      getOptionLabel={l => l.name}
                      getOptionValue={v => v.name}
                      value={{ name: flightRequirementModalModel.rsx! }}
                      onSelect={s => setFlightRequirementModalModel({ ...flightRequirementModalModel, rsx: s.name })}
                      disabled={flightRequirementModalModel.disable}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Category"
                      value={flightRequirementModalModel.category || ''}
                      onChange={l => setFlightRequirementModalModel({ ...flightRequirementModalModel, category: l.target.value })}
                      disabled={(!flightRequirementModalModel.weekly && flightRequirementModalModel.mode !== 'add') || flightRequirementModalModel.disable}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Departure"
                      value={flightRequirementModalModel.departureAirport || ''}
                      onChange={a => setFlightRequirementModalModel({ ...flightRequirementModalModel, departureAirport: a.target.value })}
                      disabled={(!flightRequirementModalModel.weekly && flightRequirementModalModel.mode !== 'add') || flightRequirementModalModel.disable}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Arrival"
                      value={flightRequirementModalModel.arrivalAirport || ''}
                      onChange={a => setFlightRequirementModalModel({ ...flightRequirementModalModel, arrivalAirport: a.target.value })}
                      disabled={(!flightRequirementModalModel.weekly && flightRequirementModalModel.mode !== 'add') || flightRequirementModalModel.disable}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Flight Number"
                      value={flightRequirementModalModel.flightNumber || ''}
                      onChange={l => setFlightRequirementModalModel({ ...flightRequirementModalModel, flightNumber: l.target.value })}
                      disabled={(!flightRequirementModalModel.weekly && flightRequirementModalModel.mode !== 'add') || flightRequirementModalModel.disable}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="BlockTime"
                      value={flightRequirementModalModel.blockTime || ''}
                      onChange={l => setFlightRequirementModalModel({ ...flightRequirementModalModel, blockTime: l.target.value })}
                      disabled={flightRequirementModalModel.disable}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <AutoComplete
                      options={MasterData.all.stcs.items}
                      label="Stc"
                      getOptionLabel={l => l.name}
                      getOptionValue={l => l.id}
                      value={flightRequirementModalModel.stc}
                      onSelect={s => {
                        setFlightRequirementModalModel({ ...flightRequirementModalModel, stc: s });
                      }}
                      isDisabled={(!flightRequirementModalModel.weekly && flightRequirementModalModel.mode !== 'add') || flightRequirementModalModel.disable}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <div>
                  <fieldset className={classes.timesFieldSet}>
                    <legend>Time(s):</legend>
                    <Grid container spacing={1} className={classes.times}>
                      {flightRequirementModalModel &&
                        flightRequirementModalModel.times &&
                        flightRequirementModalModel.times.map((t, index, self) => {
                          return (
                            <Fragment key={index}>
                              <Grid item xs={4}>
                                <TextField
                                  fullWidth
                                  label="STD Lower Bound"
                                  value={t.stdLowerBound || ''}
                                  onChange={s => {
                                    const time = flightRequirementModalModel.times!.find(s => s === t)!;
                                    time.stdLowerBound = s.target.value;
                                    setFlightRequirementModalModel({ ...flightRequirementModalModel, times: [...flightRequirementModalModel.times!] });
                                  }}
                                  disabled={flightRequirementModalModel.disable}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  fullWidth
                                  label="STD Upper Bound"
                                  value={t.stdUpperBound || ''}
                                  onChange={s => {
                                    const time = flightRequirementModalModel.times!.find(s => s === t)!;
                                    time.stdUpperBound = s.target.value;
                                    setFlightRequirementModalModel({ ...flightRequirementModalModel, times: [...flightRequirementModalModel.times!] });
                                  }}
                                  disabled={flightRequirementModalModel.disable}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                {self.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      var temp = { ...flightRequirementModalModel };
                                      temp.times = temp.times && temp.times.filter(r => r != t);
                                      setFlightRequirementModalModel(temp);
                                    }}
                                    disabled={flightRequirementModalModel.disable}
                                  >
                                    <ClearIcon />
                                  </IconButton>
                                )}
                              </Grid>
                            </Fragment>
                          );
                        })}
                    </Grid>
                  </fieldset>
                </div>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    {
                      <Typography variant="caption" className={classes.captionTextColor}>
                        Allowed Aircrafts
                      </Typography>
                    }
                  </Grid>
                  <Grid item xs={6}>
                    <MultiSelect
                      options={aircraftIdentities}
                      getOptionLabel={l => l.name}
                      getOptionValue={l => l.id}
                      value={flightRequirementModalModel.allowedAircraftIdentities}
                      onSelect={l => setFlightRequirementModalModel({ ...flightRequirementModalModel, allowedAircraftIdentities: l ? [...l] : [] })}
                    ></MultiSelect>
                  </Grid>
                  <Grid item xs={6}>
                    <MultiSelect
                      options={aircraftIdentities}
                      getOptionLabel={l => l.name}
                      getOptionValue={l => l.id}
                      value={flightRequirementModalModel.forbiddenAircraftIdentities}
                      onSelect={l => setFlightRequirementModalModel({ ...flightRequirementModalModel, forbiddenAircraftIdentities: l ? [...l] : [] })}
                    ></MultiSelect>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" className={classes.captionTextColor}>
                      Days
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" className={classes.captionTextColor}>
                      Options
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Grid item>
                      <DaysPicker
                        selectedDays={flightRequirementModalModel.days}
                        onItemClick={w => setFlightRequirementModalModel({ ...flightRequirementModalModel, days: w })}
                        disabled={(!flightRequirementModalModel.weekly && flightRequirementModalModel.mode !== 'add') || flightRequirementModalModel.disable}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={6}>
                    <Grid container>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              color="primary"
                              checked={flightRequirementModalModel.required}
                              onChange={e => setFlightRequirementModalModel({ ...flightRequirementModalModel, required: e.target.checked })}
                            />
                          }
                          label="Required"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          label="Destination Permmision"
                          control={
                            <Checkbox
                              color="primary"
                              checked={flightRequirementModalModel.destinationPermission}
                              onChange={e => setFlightRequirementModalModel({ ...flightRequirementModalModel, destinationPermission: e.target.checked })}
                            />
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          label="Origin Permission"
                          control={
                            <Checkbox
                              color="primary"
                              checked={flightRequirementModalModel.originPermission}
                              onChange={e => setFlightRequirementModalModel({ ...flightRequirementModalModel, originPermission: e.target.checked })}
                            />
                          }
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  {!flightRequirementModalModel.weekly && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Notes"
                        value={flightRequirementModalModel.notes}
                        onChange={s => setFlightRequirementModalModel({ ...flightRequirementModalModel, notes: s.target.value })}
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </div>
        </div>
      </SimpleModal>

      <SimpleModal
        key="delete-flight-requirment"
        title={flightRequirmentTitleMessage[flightRequirementModalModel.mode!]}
        open={flightRequirementModalModel.open && flightRequirementModalModel.mode === 'remove'}
        loading={flightRequirementModalModel.loading}
        errorMessage={flightRequirementModalModel.errorMessage}
        cancelable={true}
        onClose={() => setFlightRequirementModalModel({ ...flightRequirementModalModel, open: false })}
        actions={[
          {
            title: 'NO'
          },
          {
            title: 'Yes',
            action: async () => {
              setFlightRequirementModalModel({ ...flightRequirementModalModel, loading: true, errorMessage: undefined });
              const weekfr = flightRequirementModalModel;
              const flightRequirment = weekfr.flightRequirement!;

              let result: FlightRequirement | undefined;
              let resultMessage: string | undefined;

              if (flightRequirementModalModel.weekly || flightRequirment.days.length === 1) {
                const response = await PreplanService.removeFlightRequirement(flightRequirementModalModel.flightRequirement!.id);
                resultMessage = response.message;
              } else if (weekfr.day !== undefined) {
                const frScope: FlightScopeModel = {
                  blockTime: flightRequirment.scope.blockTime,
                  times: flightRequirment.scope.times!.map(t => {
                    return { stdLowerBound: t.stdLowerBound.minutes, stdUpperBound: t.stdUpperBound.minutes } as FlightTimeModel;
                  }),
                  destinationPermission: !!flightRequirment.scope.destinationPermission,
                  originPermission: !!flightRequirment.scope.originPermission,
                  required: !!flightRequirment.scope.required,
                  rsx: flightRequirment.scope.rsx!,
                  aircraftSelection: {
                    allowedIdentities: flightRequirment.scope.aircraftSelection.allowedIdentities
                      ? flightRequirment.scope.aircraftSelection.allowedIdentities.map(a => ({ entityId: a.entity && a.entity!.id, type: a.type } as AircraftIdentityModel))
                      : [],
                    forbiddenIdentities: flightRequirment.scope.aircraftSelection.forbiddenIdentities
                      ? flightRequirment.scope.aircraftSelection.forbiddenIdentities.map(a => ({ entityId: a.entity && a.entity!.id, type: a.type } as AircraftIdentityModel))
                      : []
                  }
                };

                const days = weekfr
                  .flightRequirement!.days!.filter(d => d.day !== weekfr.day!)
                  .map(w => {
                    const result: WeekdayFlightRequirementModel = {
                      day: w.day,
                      flight: {
                        std: w.flight.std.minutes,
                        aircraftRegisterId: w.flight.aircraftRegister && w.flight.aircraftRegister.id
                      },
                      freezed: w.freezed,
                      notes: w.notes,
                      scope: {
                        aircraftSelection: {
                          allowedIdentities: w.scope.aircraftSelection.allowedIdentities
                            ? w.scope.aircraftSelection.allowedIdentities.map(a => ({ entityId: a.entity.id, type: a.type } as AircraftIdentityModel))
                            : [],
                          forbiddenIdentities: w.scope.aircraftSelection.forbiddenIdentities
                            ? w.scope.aircraftSelection.forbiddenIdentities.map(a => ({ entityId: a.entity.id, type: a.type } as AircraftIdentityModel))
                            : []
                        },
                        blockTime: w.scope.blockTime,
                        destinationPermission: w.scope.destinationPermission,
                        originPermission: w.scope.originPermission,
                        required: w.scope.required,
                        rsx: w.scope.rsx,
                        times: w.scope.times.map(t => ({ stdLowerBound: t.stdLowerBound.minutes, stdUpperBound: t.stdUpperBound.minutes } as FlightTimeModel))
                      }
                    };
                    return result;
                  });

                const model: FlightRequirementModel = {
                  id: weekfr.flightRequirement!.id,
                  definition: {
                    label: (weekfr.label || '').toUpperCase(),
                    category: weekfr.category || '',
                    stcId: weekfr.stc ? weekfr.stc.id : '',
                    flightNumber: (weekfr.flightNumber || '').toUpperCase(),
                    departureAirportId: parseAirport(weekfr.departureAirport)!,
                    arrivalAirportId: parseAirport(weekfr.arrivalAirport)!
                  },
                  scope: frScope,
                  days: days,
                  ignored: false
                };

                const response = await PreplanService.editFlightRequirements([model]);
                resultMessage = response.message;
                result = new FlightRequirement(response.value![0], preplan!.aircraftRegisters);
              }

              if (resultMessage) {
                setFlightRequirementModalModel({ ...weekfr, loading: false, errorMessage: resultMessage });
              } else {
                setFlightRequirementModalModel({ ...weekfr, loading: false, open: false });

                if (flightRequirementModalModel.weekly || flightRequirment.days.length === 1) {
                  preplan!.removeFlightRequirement(flightRequirementModalModel.flightRequirement!.id);
                } else {
                  result ? preplan!.mergeFlightRequirements(result) : preplan!.mergeFlightRequirements();
                }

                setFlightRequirements([...preplan!.flightRequirements]);
              }
            }
          }
        ]}
      >
        {flightRequirementModalModel.weekly ? (
          <Typography>Delete daily flight requirement from {flightRequirementModalModel.label}.</Typography>
        ) : (
          <Typography>Delete flight requirement {flightRequirementModalModel.label}.</Typography>
        )}
      </SimpleModal>
    </Fragment>
  );
};

export default PreplanPage;
