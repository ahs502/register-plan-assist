import React, { FC, Fragment, useState, useEffect, useRef, createContext, useCallback, useMemo } from 'react';
import { Theme, TextField, Fab, Grid, Typography, IconButton, FormControlLabel, Checkbox } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import useRouter from 'src/utils/useRouter';
import NavBar from 'src/components/NavBar';
import ResourceSchedulerPage from 'src/pages/preplan/resource-scheduler';
import FlightRequirementListPage from 'src/pages/preplan/flight-requirement-list';
import ReportsPage from 'src/pages/preplan/reports';
import Preplan from 'src/business/Preplan';
import PreplanAircraftIdentity from 'src/business/PreplanAircraftIdentity';
import MasterData, { Stc } from '@core/master-data';
import FlightRequirement from 'src/business/flights/FlightRequirement';
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
import MultiSelect from 'src/components/MultiSelect';
import PreplanAircraftSelection from 'src/business/PreplanAircraftSelection';
import WeekdayFlightRequirement from 'src/business/flights/WeekdayFlightRequirement';
import PreplanAircraftRegister from 'src/business/PreplanAircraftRegister';
import { FlightRequirementModalModel, FlightRequirementModalAircraftIdentity, FlightRequirementModalMode } from 'src/components/preplan/flight-requirement/FlightRequirementEditor';

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

const rsxOptions = Rsxes.map(r => ({ name: r }));

const PreplanPage: FC = () => {
  const [preplan, setPreplan] = useState<Preplan | null>(null);
  const [flightRequirementModalModel, setFlightRequirementModalModel] = useState<FlightRequirementModalModel>({ open: false, loading: false });

  const navBarToolsRef = useRef<HTMLDivElement>(null);

  const { match } = useRouter<{ id: string }>();
  const classes = useStyles();

  const aircraftRegisterIdentities = useMemo<FlightRequirementModalAircraftIdentity[]>(
    () =>
      preplan
        ? preplan.aircraftRegisters.items.map((a, index) => ({
            entityId: a.id,
            name: a.name,
            type: 'REGISTER',
            id: 'register ' + index
          }))
        : [],
    [preplan && preplan.aircraftRegisters]
  );
  const aircraftGroupIdentities = useMemo<FlightRequirementModalAircraftIdentity[]>(
    () =>
      MasterData.all.aircraftGroups.items.map((g, index) => ({
        entityId: g.id,
        name: g.name,
        type: 'GROUP',
        id: 'group ' + index
      })),
    []
  );
  const aircraftTypeIdentities = useMemo<FlightRequirementModalAircraftIdentity[]>(
    () =>
      MasterData.all.aircraftTypes.items.flatMap((a, index) => [
        {
          entityId: a.id,
          name: a.name,
          type: 'TYPE',
          id: 'type ' + index
        },
        {
          entityId: a.id,
          name: a.name + '_DUMMY',
          type: 'TYPE_DUMMY',
          id: 'type dummy ' + index
        },
        {
          entityId: a.id,
          name: a.name + '_EXISTING',
          type: 'TYPE_EXISTING',
          id: 'type existing ' + index
        }
      ]),
    []
  );
  const aircraftIdentities = useMemo<FlightRequirementModalAircraftIdentity[]>(() => aircraftRegisterIdentities.concat(aircraftGroupIdentities).concat(aircraftTypeIdentities), [
    aircraftRegisterIdentities,
    aircraftGroupIdentities,
    aircraftTypeIdentities
  ]);

  useEffect(() => {
    //TODO: Load preplan by match.params.id from server if not loaded yet.
    //TODO: Go back to preplan list when not succeeded:
    // history.push('/preplan-list');
    PreplanService.get(match.params.id).then(p => {
      if (p.message) {
        //TODO: Do something!
      } else {
        const preplan = new Preplan(p.value!);
        setPreplan(preplan);
      }
    });
  }, [match.params.id]);

  const resourceSchedulerPageSelected = window.location.href.startsWith(`${window.location.host}/#${match.url}/resource-scheduler`);
  const flightRequirementListPageSelected = window.location.href.startsWith(`${window.location.host}/#${match.url}/flight-requirement-list`);
  const reportsPageSelected = window.location.href.startsWith(`${window.location.host}/#${match.url}/reports`);

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
      {preplan && (
        <NavBarToolsContainerContext.Provider value={navBarToolsRef.current}>
          <Switch>
            <Redirect exact from={match.url} to={match.url + '/resource-scheduler'} />
            <Route
              exact
              path={match.path + '/resource-scheduler'}
              render={() => (
                <ResourceSchedulerPage
                  preplan={preplan}
                  onEditFlightRequirement={f => applyFlightRequirementModalModel('EDIT', f)}
                  onEditWeekdayFlightRequirement={(f, weekdayFlightRequirement) => applyFlightRequirementModalModel('EDIT', f, weekdayFlightRequirement)}
                />
              )}
            />
            <Route
              exact
              path={match.path + '/flight-requirement-list'}
              render={() => (
                <FlightRequirementListPage
                  flightRequirements={preplan!.flightRequirements}
                  preplan={preplan}
                  onAddFlightRequirement={() => applyFlightRequirementModalModel('ADD')}
                  onRemoveFlightRequirement={f => applyFlightRequirementModalModel('REMOVE', f)}
                  onEditFlightRequirement={f => applyFlightRequirementModalModel('EDIT', f)}
                  onAddReturnFlightRequirement={f => applyFlightRequirementModalModel('RETURN', f)}
                  onRemoveWeekdayFlightRequirement={(weekday, fr) => applyFlightRequirementModalModel('REMOVE', fr, weekday)}
                  onEditWeekdayFlightRequirement={(weekday, fr) => applyFlightRequirementModalModel('EDIT', fr, weekday)}
                />
              )}
            />
            <Route exact path={match.path + '/reports/:report?'} component={() => <ReportsPage preplan={preplan} />} />
            <Redirect to={match.url} />
          </Switch>
        </NavBarToolsContainerContext.Provider>
      )}

      <SimpleModal
        key="flightRequirementEditor"
        title={
          flightRequirementModalModel.mode === 'ADD'
            ? 'What is the new flight requirement?'
            : flightRequirementModalModel.mode === 'EDIT'
            ? 'Edit flight requirement'
            : flightRequirementModalModel.mode === 'READ_ONLY'
            ? 'Flight requirement'
            : flightRequirementModalModel.mode === 'RETURN'
            ? 'What is the returning/next flight requirement?'
            : ''
        }
        open={
          flightRequirementModalModel.open &&
          (flightRequirementModalModel.mode === 'ADD' || flightRequirementModalModel.mode === 'EDIT' || flightRequirementModalModel.mode === 'RETURN')
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
              if (
                flightRequirementModalModel.mode === 'ADD' ||
                flightRequirementModalModel.mode === 'RETURN' ||
                (flightRequirementModalModel.mode === 'EDIT' && flightRequirementModalModel.weekly)
              )
                return await addOrEditFlightRequirement();

              if (flightRequirementModalModel.mode === 'EDIT' && !flightRequirementModalModel.weekly) return await editWeekdayFlightRequirement();

              async function addOrEditFlightRequirement() {
                setFlightRequirementModalModel({ ...flightRequirementModalModel, loading: true, errorMessage: undefined });

                const scope: FlightScopeModel = {
                  blockTime: parseHHMM(flightRequirementModalModel.blockTime),
                  times: flightRequirementModalModel.times!.map(t => {
                    return { stdLowerBound: parseHHMM(t.stdLowerBound), stdUpperBound: parseHHMM(t.stdUpperBound) } as FlightTimeModel;
                  }),
                  destinationPermission: !!flightRequirementModalModel.destinationPermission,
                  originPermission: !!flightRequirementModalModel.originPermission,
                  required: !!flightRequirementModalModel.required,
                  rsx: flightRequirementModalModel.rsx!,
                  aircraftSelection: {
                    allowedIdentities: flightRequirementModalModel.allowedAircraftIdentities
                      ? flightRequirementModalModel.allowedAircraftIdentities.map(a => ({ entityId: a.entityId, type: a.type } as AircraftIdentityModel))
                      : [],
                    forbiddenIdentities: flightRequirementModalModel.forbiddenAircraftIdentities
                      ? flightRequirementModalModel.forbiddenAircraftIdentities.map(a => ({ entityId: a.entityId, type: a.type } as AircraftIdentityModel))
                      : []
                  }
                };

                const aircraftRegister: PreplanAircraftRegister | undefined = new PreplanAircraftSelection(
                  scope.aircraftSelection,
                  preplan!.aircraftRegisters
                ).resolveIncluded()[0];

                const model: FlightRequirementModel = {
                  id: flightRequirementModalModel.mode === 'EDIT' ? flightRequirementModalModel.flightRequirement!.id : undefined,
                  definition: {
                    label: (flightRequirementModalModel.label || '').toUpperCase(),
                    category: flightRequirementModalModel.category || '',
                    stcId: flightRequirementModalModel.stc ? flightRequirementModalModel.stc.id : '',
                    flightNumber: (flightRequirementModalModel.flightNumber || '').toUpperCase(),
                    departureAirportId: parseAirport(flightRequirementModalModel.departureAirport)!,
                    arrivalAirportId: parseAirport(flightRequirementModalModel.arrivalAirport)!
                  },
                  scope: scope,
                  days: flightRequirementModalModel
                    .days!.map((e, i) => (e ? i : -1))
                    .filter(d => d >= 0)
                    .map(d => {
                      //TODO: update flight only in add move
                      // let flight: FlightModel;
                      // if (flightRequirementModalModel.mode === 'add') {
                      //   flight = {
                      //     std: scope.times[0].stdLowerBound,
                      //     aircraftRegisterId: aircraftRegister && aircraftRegister.id
                      //   };
                      // } else {
                      //   const flight = flightRequirementModalModel.flightRequirement!.days.find(m => m.day === d)!.flight;
                      // }
                      return {
                        day: d,
                        notes: flightRequirementModalModel.notes || '',
                        scope: scope,
                        freezed: false,
                        flight: {
                          std: scope.times[0].stdLowerBound,
                          aircraftRegisterId: aircraftRegister && aircraftRegister.id
                        }
                      };
                    }),
                  ignored: false
                };

                const validation = new FlightRequirementValidation(model, preplan!.aircraftRegisters.items.map(a => a.id));
                if (!validation.ok) {
                  setFlightRequirementModalModel(flightRequirementModalModel => ({ ...flightRequirementModalModel, loading: false }));
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
                  setFlightRequirementModalModel(flightRequirementModalModel => ({ ...flightRequirementModalModel, loading: false, errorMessage: resultMessage }));
                } else {
                  preplan!.mergeFlightRequirements(result!);
                  //setFlightRequirementModalModel(flightRequirementModalModel => ({ ...flightRequirementModalModel, loading: false, open: false }));
                  setFlightRequirementModalModel({ ...flightRequirementModalModel, loading: false, open: false, errorMessage: undefined });
                }
              }

              async function editWeekdayFlightRequirement() {
                const weekDayScope: FlightScopeModel = {
                  blockTime: parseHHMM(flightRequirementModalModel.blockTime),
                  times: flightRequirementModalModel.times!.map(t => ({ stdLowerBound: parseHHMM(t.stdLowerBound), stdUpperBound: parseHHMM(t.stdUpperBound) })),
                  destinationPermission: !!flightRequirementModalModel.destinationPermission,
                  originPermission: !!flightRequirementModalModel.originPermission,
                  required: !!flightRequirementModalModel.required,
                  rsx: flightRequirementModalModel.rsx!,
                  aircraftSelection: {
                    allowedIdentities: flightRequirementModalModel.allowedAircraftIdentities
                      ? flightRequirementModalModel.allowedAircraftIdentities.map(a => ({ entityId: a.entityId, type: a.type }))
                      : [],
                    forbiddenIdentities: flightRequirementModalModel.forbiddenAircraftIdentities
                      ? flightRequirementModalModel.forbiddenAircraftIdentities.map(a => ({ entityId: a.entityId, type: a.type }))
                      : []
                  }
                };

                const flightRequirment = flightRequirementModalModel.flightRequirement!;
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

                const days = flightRequirementModalModel
                  .flightRequirement!.days!.filter(d => d.day !== flightRequirementModalModel.day!)
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
                  day: flightRequirementModalModel.day!,
                  flight: {
                    std: weekDayScope.times[0].stdLowerBound,
                    aircraftRegisterId: aircraftRegister && aircraftRegister.id
                  },
                  freezed: false,
                  notes: flightRequirementModalModel.notes || '',
                  scope: weekDayScope
                };

                days.push(day);
                const model: FlightRequirementModel = {
                  id: flightRequirementModalModel.flightRequirement!.id,
                  definition: {
                    label: (flightRequirementModalModel.label || '').toUpperCase(),
                    category: flightRequirementModalModel.category || '',
                    stcId: flightRequirementModalModel.stc ? flightRequirementModalModel.stc.id : '',
                    flightNumber: (flightRequirementModalModel.flightNumber || '').toUpperCase(),
                    departureAirportId: parseAirport(flightRequirementModalModel.departureAirport)!,
                    arrivalAirportId: parseAirport(flightRequirementModalModel.arrivalAirport)!
                  },
                  scope: frScope,
                  days: days,
                  ignored: false
                };

                const validation = new FlightRequirementValidation(model, preplan!.aircraftRegisters.items.map(a => a.id));
                if (!validation.ok) {
                  setFlightRequirementModalModel(flightRequirementModalModel => ({ ...flightRequirementModalModel, loading: false }));
                  return;
                }

                const result = await PreplanService.editFlightRequirements([model]);

                if (result.message) {
                  setFlightRequirementModalModel(flightRequirementModalModel => ({ ...flightRequirementModalModel, loading: false, errorMessage: result.message }));
                } else {
                  preplan!.mergeFlightRequirements(result.value![0]);
                  setFlightRequirementModalModel(flightRequirementModalModel => ({ ...flightRequirementModalModel, loading: false, open: false }));
                  //setFlightRequirements([...preplan!.flightRequirements]);
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
                      disabled={(!flightRequirementModalModel.weekly && flightRequirementModalModel.mode !== 'ADD') || flightRequirementModalModel.disable}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    {/* <InputLabel htmlFor="rsx">RSX</InputLabel> */}
                    <AutoComplete
                      label="RSX"
                      options={rsxOptions}
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
                      disabled={(!flightRequirementModalModel.weekly && flightRequirementModalModel.mode !== 'ADD') || flightRequirementModalModel.disable}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Departure"
                      value={flightRequirementModalModel.departureAirport || ''}
                      onChange={a => setFlightRequirementModalModel({ ...flightRequirementModalModel, departureAirport: a.target.value })}
                      disabled={(!flightRequirementModalModel.weekly && flightRequirementModalModel.mode !== 'ADD') || flightRequirementModalModel.disable}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Arrival"
                      value={flightRequirementModalModel.arrivalAirport || ''}
                      onChange={a => setFlightRequirementModalModel({ ...flightRequirementModalModel, arrivalAirport: a.target.value })}
                      disabled={(!flightRequirementModalModel.weekly && flightRequirementModalModel.mode !== 'ADD') || flightRequirementModalModel.disable}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Flight Number"
                      value={flightRequirementModalModel.flightNumber || ''}
                      onChange={l => setFlightRequirementModalModel({ ...flightRequirementModalModel, flightNumber: l.target.value })}
                      disabled={(!flightRequirementModalModel.weekly && flightRequirementModalModel.mode !== 'ADD') || flightRequirementModalModel.disable}
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
                      isDisabled={(!flightRequirementModalModel.weekly && flightRequirementModalModel.mode !== 'ADD') || flightRequirementModalModel.disable}
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
                  <Grid item xs={6}>
                    <Typography variant="caption" className={classes.captionTextColor}>
                      Allowed Aircrafts
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" className={classes.captionTextColor}>
                      Forbidden Aircrafts
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <MultiSelect
                      options={aircraftIdentities}
                      getOptionLabel={l => l.name}
                      getOptionValue={l => l.id}
                      value={flightRequirementModalModel.allowedAircraftIdentities}
                      isDisabled={flightRequirementModalModel.mode === 'RETURN' || flightRequirementModalModel.disable}
                      onSelect={l => setFlightRequirementModalModel({ ...flightRequirementModalModel, allowedAircraftIdentities: l ? [...l] : [] })}
                    ></MultiSelect>
                  </Grid>
                  <Grid item xs={6}>
                    <MultiSelect
                      options={aircraftIdentities}
                      getOptionLabel={l => l.name}
                      getOptionValue={l => l.id}
                      value={flightRequirementModalModel.forbiddenAircraftIdentities}
                      isDisabled={flightRequirementModalModel.mode === 'RETURN' || flightRequirementModalModel.disable}
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
                        disabled={(!flightRequirementModalModel.weekly && flightRequirementModalModel.mode !== 'ADD') || flightRequirementModalModel.disable}
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
        title="Would you like to delete this flight requirement?"
        open={flightRequirementModalModel.open && flightRequirementModalModel.mode === 'REMOVE'}
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

              let result: FlightRequirementModel[] | undefined;
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
                result = response.value;
              }

              if (resultMessage) {
                setFlightRequirementModalModel(flightRequirementModalModel => ({ ...flightRequirementModalModel, loading: false, errorMessage: resultMessage }));
              } else {
                if (flightRequirementModalModel.weekly || flightRequirment.days.length === 1) {
                  preplan!.removeFlightRequirement(flightRequirementModalModel.flightRequirement!.id);
                } else {
                  result && result[0] ? preplan!.mergeFlightRequirements(result[0]) : preplan!.mergeFlightRequirements();
                }

                setFlightRequirementModalModel(flightRequirementModalModel => ({ ...flightRequirementModalModel, loading: false, open: false }));
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

  function applyFlightRequirementModalModel(mode: FlightRequirementModalMode, flightRequirement?: FlightRequirement, weekdayFlightRequirement?: WeekdayFlightRequirement): void {
    const model: FlightRequirementModalModel = {
      open: true,
      loading: false,
      actionTitle: mode === 'ADD' || mode === 'RETURN' ? 'Add' : 'Edit',
      mode: mode,
      rsx: 'REAL',
      times: [{ stdLowerBound: '', stdUpperBound: '' }],
      stc: MasterData.all.stcs.items.find(n => n.name === 'J'),
      flightRequirement
    };

    if (flightRequirement) {
      model.days = Array.range(0, 6).map(() => false);
      flightRequirement.days.forEach(d => (model.days![d.day] = true));

      const allowedIdentities = weekdayFlightRequirement
        ? weekdayFlightRequirement.scope.aircraftSelection.allowedIdentities
        : flightRequirement.scope.aircraftSelection.allowedIdentities;
      model.allowedAircraftIdentities = convertPreplanAircraftIdentityToAircraftIdentity(allowedIdentities);

      const forbiddenIdentities = weekdayFlightRequirement
        ? weekdayFlightRequirement.scope.aircraftSelection.forbiddenIdentities
        : flightRequirement.scope.aircraftSelection.forbiddenIdentities;
      model.forbiddenAircraftIdentities = convertPreplanAircraftIdentityToAircraftIdentity(forbiddenIdentities);

      model.arrivalAirport = mode === 'RETURN' ? flightRequirement.definition.departureAirport.name : flightRequirement.definition.arrivalAirport.name;
      model.departureAirport = mode === 'RETURN' ? flightRequirement.definition.arrivalAirport.name : flightRequirement.definition.departureAirport.name;
      model.blockTime = weekdayFlightRequirement ? parseMinute(weekdayFlightRequirement.scope.blockTime) : parseMinute(flightRequirement.scope.blockTime);
      model.category = flightRequirement.definition.category;
      model.destinationPermission = weekdayFlightRequirement ? weekdayFlightRequirement.scope.destinationPermission : flightRequirement.scope.destinationPermission;
      model.flightNumber = flightRequirement.definition.flightNumber;
      model.label = flightRequirement.definition.label;
      model.notes = weekdayFlightRequirement && weekdayFlightRequirement.notes;
      model.weekly = !weekdayFlightRequirement;
      model.originPermission = weekdayFlightRequirement ? weekdayFlightRequirement.scope.originPermission : flightRequirement.scope.originPermission;
      model.required = weekdayFlightRequirement ? weekdayFlightRequirement.scope.required : flightRequirement.scope.required;
      model.rsx = weekdayFlightRequirement ? weekdayFlightRequirement.scope.rsx : flightRequirement.scope.rsx;
      model.stc = flightRequirement.definition.stc;
      model.times = (weekdayFlightRequirement ? weekdayFlightRequirement.scope.times : flightRequirement.scope.times).map(t => ({
        stdLowerBound: parseMinute(t.stdLowerBound.minutes + (mode === 'RETURN' ? 120 + flightRequirement.scope.blockTime : 0)),
        stdUpperBound: parseMinute(t.stdUpperBound.minutes + (mode === 'RETURN' ? 120 + flightRequirement.scope.blockTime : 0))
      }));
      model.day = weekdayFlightRequirement && weekdayFlightRequirement.day;
      //modalModel.unavailableDays =
    }

    setFlightRequirementModalModel(model);

    function convertPreplanAircraftIdentityToAircraftIdentity(preplanAircraftIdentities: readonly PreplanAircraftIdentity[]): FlightRequirementModalAircraftIdentity[] {
      return preplanAircraftIdentities.map(n => aircraftIdentities.find(a => a.entityId === n.entity.id && a.type === n.type)!);
    }
  }
};

export default PreplanPage;
