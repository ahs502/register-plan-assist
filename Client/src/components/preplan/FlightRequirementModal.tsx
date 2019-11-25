import React, { FC, useMemo, useContext, Fragment } from 'react';
import { Theme, Typography, Grid, Paper, Tabs, Tab, Checkbox, IconButton, FormControlLabel } from '@material-ui/core';
import { Clear as ClearIcon, Add as AddIcon, WrapText as WrapTextIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalViewState, useModalState } from 'src/components/BaseModal';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Weekday, { Weekdays } from '@core/types/Weekday';
import AutoComplete from 'src/components/AutoComplete';
import MultiSelect from 'src/components/MultiSelect';
import MasterData from '@core/master-data';
import { Rsxes } from '@core/types/Rsx';
import AircraftIdentityType from '@core/types/AircraftIdentityType';
import { PreplanContext, ReloadPreplanContext } from 'src/pages/preplan';
import NewFlightRequirementModel from '@core/models/flight-requirement/NewFlightRequirementModel';
import FlightModel from '@core/models/flight/FlightModel';
import NewFlightModel from '@core/models/flight/NewFlightModel';
import PreplanAircraftSelection from 'src/business/preplan/PreplanAircraftSelection';
import FlightLegModel from '@core/models/flight/FlightLegModel';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';
import FlightRequirementLegModel from '@core/models/flight-requirement/FlightRequirementLegModel';
import DayFlightRequirementModel from '@core/models/flight-requirement/DayFlightRequirementModel';
import Flight from 'src/business/flight/Flight';
import FlightRequirementService from 'src/services/FlightRequirementService';
import DayFlightRequirementLegModel from '@core/models/flight-requirement/DayFlightRequirementLegModel';
import { dataTypes } from 'src/utils/DataType';
import RefiningTextField from 'src/components/RefiningTextField';
import { ViewState, AircraftIdentityOptionViewState, RouteLegViewState, DayTabViewState, LegViewState } from 'src/components/preplan/FlightRequirementModal.types';

const useStyles = makeStyles((theme: Theme) => ({
  dayTab: {
    minWidth: 'unset'
  },
  tabPaper: {
    padding: theme.spacing(2)
  },
  flex: {
    display: 'flex'
  },
  grow: {
    flexGrow: 1
  },
  checkboxContainer: {
    height: 48
  }
}));

export interface FlightRequirementModalState {
  flightRequirement?: FlightRequirement;
  day?: Weekday;
}

export interface FlightRequirementModalProps extends BaseModalProps<FlightRequirementModalState> {}

const FlightRequirementModal: FC<FlightRequirementModalProps> = ({ state: [open, { flightRequirement, day }], ...others }) => {
  const preplan = useContext(PreplanContext);
  const reloadPreplan = useContext(ReloadPreplanContext);

  const rsxOptions = useMemo(() => Rsxes.map(r => ({ name: r })), []);
  const aircraftIdentityOptions = useMemo<AircraftIdentityOptionViewState[]>(
    () => [
      ...preplan.aircraftRegisters.items.map((a, index) => ({
        id: 'register ' + index,
        name: a.name,
        type: 'REGISTER' as AircraftIdentityType,
        entityId: a.id
      })),
      ...MasterData.all.aircraftTypes.items.flatMap((a, index) => [
        {
          id: 'type ' + index,
          name: a.name,
          type: 'TYPE' as AircraftIdentityType,
          entityId: a.id
        },
        {
          id: 'type dummy ' + index,
          name: a.name + '_DUMMY',
          type: 'TYPE_DUMMY' as AircraftIdentityType,
          entityId: a.id
        },
        {
          id: 'type existing ' + index,
          name: a.name + '_EXISTING',
          type: 'TYPE_EXISTING' as AircraftIdentityType,
          entityId: a.id
        }
      ]),
      ...MasterData.all.aircraftRegisterGroups.items.map((g, index) => ({
        id: 'group ' + index,
        name: g.name,
        type: 'GROUP' as AircraftIdentityType,
        entityId: g.id
      }))
    ],
    [preplan]
  );

  const [viewState, setViewState, render] = useModalViewState<ViewState>(
    open,
    {
      label: '',
      category: '',
      stc: MasterData.all.stcs.items.find(s => s.name === 'J')!,
      tabIndex: 'ALL',
      legIndex: 0,
      default: {
        rsx: 'REAL',
        notes: '',
        allowedAircraftIdentities: [],
        forbiddenAircraftIdentities: [],
        legs: [
          {
            blockTime: '',
            stdLowerBound: '',
            stdUpperBound: '',
            originPermission: false,
            destinationPermission: false
          }
        ]
      },
      route: [
        {
          flightNumber: '',
          departureAirport: '',
          arrivalAirport: ''
        }
      ],
      days: Weekdays.map<DayTabViewState>(d => ({
        selected: false,
        rsx: 'REAL',
        notes: '',
        allowedAircraftIdentities: [],
        forbiddenAircraftIdentities: [],
        legs: [
          {
            blockTime: '',
            stdLowerBound: '',
            stdUpperBound: '',
            originPermission: false,
            destinationPermission: false
          }
        ]
      }))
    },
    () =>
      flightRequirement && {
        label: dataTypes.label.convertBusinessToView(flightRequirement.label),
        category: dataTypes.name.convertBusinessToView(flightRequirement.category),
        stc: flightRequirement.stc,
        tabIndex: day === undefined ? 'ALL' : day,
        legIndex: 0,
        default: {
          rsx: flightRequirement.rsx,
          notes: dataTypes.name.convertBusinessToView(flightRequirement.notes),
          allowedAircraftIdentities: flightRequirement.aircraftSelection.includedIdentities.map(
            i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
          ),
          forbiddenAircraftIdentities: flightRequirement.aircraftSelection.excludedIdentities.map(
            i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
          ),
          legs: flightRequirement.route.map<LegViewState>(l => ({
            blockTime: dataTypes.daytime.convertBusinessToView(l.blockTime),
            stdLowerBound: dataTypes.daytime.convertBusinessToView(l.stdLowerBound),
            stdUpperBound: dataTypes.daytime.convertBusinessToViewOptional(l.stdUpperBound),
            originPermission: l.originPermission,
            destinationPermission: l.destinationPermission
          }))
        },
        route: flightRequirement.route.map<RouteLegViewState>((l, index) => ({
          originalIndex: index,
          flightNumber: dataTypes.flightNumber.convertBusinessToView(l.flightNumber),
          departureAirport: dataTypes.airport.convertBusinessToView(l.departureAirport),
          arrivalAirport: dataTypes.airport.convertBusinessToView(l.arrivalAirport)
        })),
        days: Weekdays.map<DayTabViewState>(d => {
          const sourceDayFlightRequirement = flightRequirement.days.find(x => x.day === d);
          return {
            selected: !!sourceDayFlightRequirement,
            rsx: sourceDayFlightRequirement ? sourceDayFlightRequirement.rsx : flightRequirement.rsx,
            notes: dataTypes.name.convertBusinessToView(sourceDayFlightRequirement ? sourceDayFlightRequirement.notes : flightRequirement.notes),
            allowedAircraftIdentities: (sourceDayFlightRequirement ? sourceDayFlightRequirement.aircraftSelection : flightRequirement.aircraftSelection).includedIdentities.map(
              i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
            ),
            forbiddenAircraftIdentities: (sourceDayFlightRequirement ? sourceDayFlightRequirement.aircraftSelection : flightRequirement.aircraftSelection).excludedIdentities.map(
              i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
            ),
            legs: sourceDayFlightRequirement
              ? sourceDayFlightRequirement.route.map<LegViewState>(l => ({
                  blockTime: dataTypes.daytime.convertBusinessToView(l.blockTime),
                  stdLowerBound: dataTypes.daytime.convertBusinessToView(l.stdLowerBound),
                  stdUpperBound: dataTypes.daytime.convertBusinessToViewOptional(l.stdUpperBound),
                  originPermission: l.originPermission,
                  destinationPermission: l.destinationPermission
                }))
              : flightRequirement.route.map<LegViewState>(l => ({
                  blockTime: dataTypes.daytime.convertBusinessToView(l.blockTime),
                  stdLowerBound: dataTypes.daytime.convertBusinessToView(l.stdLowerBound),
                  stdUpperBound: dataTypes.daytime.convertBusinessToViewOptional(l.stdUpperBound),
                  originPermission: l.originPermission,
                  destinationPermission: l.destinationPermission
                }))
          };
        })
      }
  );
  const tabViewState = viewState.tabIndex === 'ALL' ? viewState.default : viewState.days[viewState.tabIndex];
  const routeLegViewState = viewState.route[viewState.legIndex];
  const legViewState = viewState.tabIndex === 'ALL' ? viewState.default.legs[viewState.legIndex] : viewState.days[viewState.tabIndex].legs[viewState.legIndex];

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      open={open}
      maxWidth="md"
      cancelable={true}
      title={flightRequirement ? 'What are your intended changes?' : 'What is the new flight requirement?'}
      actions={[
        {
          title: 'Cancel'
        },
        {
          title: 'Submit',
          action: async () => {
            //TODO: Validate the view model first.

            const newFlightRequirementModel: NewFlightRequirementModel = {
              label: dataTypes.label.convertViewToModel(viewState.label),
              category: dataTypes.name.convertViewToModel(viewState.category),
              stcId: dataTypes.stc.convertBusinessToModel(viewState.stc),
              aircraftSelection: {
                includedIdentities: viewState.default.allowedAircraftIdentities.map<AircraftIdentityModel>(i => ({
                  type: i.type,
                  entityId: i.entityId
                })),
                excludedIdentities: viewState.default.forbiddenAircraftIdentities.map<AircraftIdentityModel>(i => ({
                  type: i.type,
                  entityId: i.entityId
                }))
              },
              rsx: viewState.default.rsx,
              notes: dataTypes.name.convertViewToModel(viewState.default.notes),
              ignored: flightRequirement ? flightRequirement.ignored : false,
              route: viewState.default.legs.map<FlightRequirementLegModel>((l, index) => ({
                flightNumber: dataTypes.flightNumber.convertViewToModel(viewState.route[index].flightNumber),
                departureAirportId: dataTypes.airport.convertViewToModel(viewState.route[index].departureAirport),
                arrivalAirportId: dataTypes.airport.convertViewToModel(viewState.route[index].arrivalAirport),
                blockTime: dataTypes.daytime.convertViewToModel(l.blockTime),
                stdLowerBound: dataTypes.daytime.convertViewToModel(l.stdLowerBound),
                stdUpperBound: dataTypes.daytime.convertViewToModelOptional(l.stdUpperBound),
                originPermission: l.originPermission,
                destinationPermission: l.destinationPermission
              })),
              days: viewState.days
                .map<{ selected: boolean; model: DayFlightRequirementModel }>((d, index) => ({
                  selected: d.selected,
                  model: {
                    aircraftSelection: {
                      includedIdentities: d.allowedAircraftIdentities.map(i => ({
                        type: i.type,
                        entityId: i.entityId
                      })),
                      excludedIdentities: d.forbiddenAircraftIdentities.map(i => ({
                        type: i.type,
                        entityId: i.entityId
                      }))
                    },
                    rsx: d.rsx,
                    day: index,
                    notes: dataTypes.name.convertViewToModel(d.notes),
                    route: d.legs.map<DayFlightRequirementLegModel>(l => ({
                      blockTime: dataTypes.daytime.convertViewToModel(l.blockTime),
                      stdLowerBound: dataTypes.daytime.convertViewToModel(l.stdLowerBound),
                      stdUpperBound: dataTypes.daytime.convertViewToModelOptional(l.stdUpperBound),
                      originPermission: l.originPermission,
                      destinationPermission: l.destinationPermission
                    }))
                  }
                }))
                .filter(x => x.selected)
                .map(x => x.model)
            };

            const flights: Flight[] = flightRequirement ? preplan.flights.filter(f => f.flightRequirement === flightRequirement) : [];

            const newFlightModels: NewFlightModel[] = newFlightRequirementModel.days
              .filter(d => !flights.some(f => f.day === d.day))
              .map<NewFlightModel>(d => ({
                day: d.day,
                aircraftRegisterId: (new PreplanAircraftSelection(d.aircraftSelection, preplan.aircraftRegisters).backupAircraftRegister || { id: undefined }).id,
                legs: d.route.map<FlightLegModel>(l => ({
                  std: l.stdLowerBound
                }))
              }));

            const flightModels: FlightModel[] = flights.filter(f => newFlightRequirementModel.days.some(d => d.day === f.day)).map(f => f.extractModel());

            const newPreplanModel = flightRequirement
              ? await FlightRequirementService.edit(preplan.id, { id: flightRequirement.id, ...newFlightRequirementModel }, flightModels, newFlightModels)
              : await FlightRequirementService.add(preplan.id, newFlightRequirementModel, newFlightModels);
            await reloadPreplan(newPreplanModel);
            return others.onClose();
          }
        }
      ]}
    >
      <Grid container spacing={2}>
        {/* General */}
        <Grid item xs={5}>
          <RefiningTextField fullWidth label="Label" dataType={dataTypes.label} value={viewState.label} onChange={e => setViewState({ ...viewState, label: e.target.value })} />
        </Grid>
        <Grid item xs={5}>
          <RefiningTextField
            fullWidth
            label="Category"
            dataType={dataTypes.name}
            value={viewState.category}
            onChange={e => setViewState({ ...viewState, category: e.target.value })}
          />
        </Grid>
        <Grid item xs={2}>
          <AutoComplete
            options={MasterData.all.stcs.items}
            label="Stc"
            getOptionLabel={l => l.name}
            getOptionValue={l => l.id}
            value={viewState.stc}
            onSelect={stc => setViewState({ ...viewState, stc })}
          />
        </Grid>

        {/* Days */}
        <Grid item xs={12} container>
          {/* Day tabs */}
          <Grid item xs={1}>
            <div className={classes.checkboxContainer}>
              <Checkbox
                indeterminate={viewState.days.some(d => d.selected) && !viewState.days.every(d => d.selected)}
                checked={viewState.days.every(d => d.selected)}
                onChange={e => {
                  const selected = !viewState.days.every(d => d.selected);
                  setViewState({ ...viewState, days: Weekdays.map(d => ({ ...viewState.default, selected })) });
                }}
                color="primary"
              />
            </div>
            {Weekdays.map(d => (
              <div className={classes.checkboxContainer} key={d}>
                <Checkbox
                  checked={viewState.days[d].selected}
                  onChange={e => setViewState({ ...viewState, days: daysButOne(d, { ...viewState.default, selected: e.target.checked }) })}
                />
              </div>
            ))}
          </Grid>
          <Grid item xs={1}>
            <Tabs value={viewState.tabIndex} onChange={(e, tabIndex) => setViewState({ ...viewState, tabIndex })} variant="fullWidth" orientation="vertical">
              <Tab classes={{ root: classes.dayTab }} value="ALL" label="(All)" />
              {Weekdays.map(d => (
                <Tab key={d} classes={{ root: classes.dayTab }} value={d} label={Weekday[d].slice(0, 3)} />
              ))}
            </Tabs>
          </Grid>

          {/* Day content */}
          <Grid item xs={10}>
            <Paper classes={{ root: classes.tabPaper }}>
              <Grid container spacing={2}>
                {/* Day general */}
                <Grid item xs={2}>
                  <AutoComplete
                    label="RSX"
                    options={rsxOptions}
                    getOptionLabel={l => l.name}
                    getOptionValue={v => v.name}
                    value={rsxOptions.find(o => o.name === tabViewState.rsx)}
                    onSelect={({ name: rsx }) =>
                      setViewState(
                        viewState.tabIndex === 'ALL'
                          ? { ...viewState, default: { ...viewState.default, rsx }, days: viewState.days.map(day => ({ ...day, rsx })) }
                          : { ...viewState, days: daysButOne(viewState.tabIndex, day => ({ ...day, rsx })) }
                      )
                    }
                    isDisabled={viewState.tabIndex !== 'ALL' && !viewState.days[viewState.tabIndex].selected}
                  />
                </Grid>
                <Grid item xs={10}>
                  <RefiningTextField
                    fullWidth
                    label="Notes"
                    dataType={dataTypes.name}
                    value={tabViewState.notes}
                    onChange={({ target: { value: notes } }) =>
                      setViewState(
                        viewState.tabIndex === 'ALL'
                          ? { ...viewState, default: { ...viewState.default, notes }, days: viewState.days.map(day => ({ ...day, notes })) }
                          : { ...viewState, days: daysButOne(viewState.tabIndex, day => ({ ...day, notes })) }
                      )
                    }
                    disabled={viewState.tabIndex !== 'ALL' && !viewState.days[viewState.tabIndex].selected}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption">Allowed Aircrafts</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption">Forbidden Aircrafts</Typography>
                </Grid>
                <Grid item xs={6}>
                  <MultiSelect
                    options={aircraftIdentityOptions}
                    getOptionLabel={l => l.name}
                    getOptionValue={l => l.id}
                    value={tabViewState.allowedAircraftIdentities}
                    onSelect={allowedAircraftIdentities =>
                      setViewState(
                        viewState.tabIndex === 'ALL'
                          ? {
                              ...viewState,
                              default: { ...viewState.default, allowedAircraftIdentities: allowedAircraftIdentities ? allowedAircraftIdentities : [] },
                              days: viewState.days.map(day => ({ ...day, allowedAircraftIdentities: allowedAircraftIdentities ? allowedAircraftIdentities : [] }))
                            }
                          : {
                              ...viewState,
                              days: daysButOne(viewState.tabIndex, day => ({ ...day, allowedAircraftIdentities: allowedAircraftIdentities ? allowedAircraftIdentities : [] }))
                            }
                      )
                    }
                    isDisabled={viewState.tabIndex !== 'ALL' && !viewState.days[viewState.tabIndex].selected}
                  ></MultiSelect>
                </Grid>
                <Grid item xs={6}>
                  <MultiSelect
                    options={aircraftIdentityOptions}
                    getOptionLabel={l => l.name}
                    getOptionValue={l => l.id}
                    value={tabViewState.forbiddenAircraftIdentities}
                    onSelect={forbiddenAircraftIdentities =>
                      setViewState(
                        viewState.tabIndex === 'ALL'
                          ? {
                              ...viewState,
                              default: { ...viewState.default, forbiddenAircraftIdentities: forbiddenAircraftIdentities ? forbiddenAircraftIdentities : [] },
                              days: viewState.days.map(day => ({ ...day, forbiddenAircraftIdentities: forbiddenAircraftIdentities ? forbiddenAircraftIdentities : [] }))
                            }
                          : {
                              ...viewState,
                              days: daysButOne(viewState.tabIndex, day => ({ ...day, forbiddenAircraftIdentities: forbiddenAircraftIdentities ? forbiddenAircraftIdentities : [] }))
                            }
                      )
                    }
                    isDisabled={viewState.tabIndex !== 'ALL' && !viewState.days[viewState.tabIndex].selected}
                  ></MultiSelect>
                </Grid>

                {/* Legs */}
                <Grid item xs={12}>
                  {/* Leg tabs */}
                  <div className={classes.flex}>
                    <Tabs variant="scrollable" scrollButtons="auto" value={viewState.legIndex} onChange={(e, legIndex) => setViewState({ ...viewState, legIndex })}>
                      {tabViewState.legs.map((leg, legIndex) => (
                        <Tab
                          key={legIndex}
                          label={
                            <div className={classes.flex}>
                              <div className={classes.grow}>
                                <Typography variant="caption" display="block">
                                  {viewState.route[legIndex].flightNumber || <Fragment>&mdash;</Fragment>}
                                </Typography>
                                {legIndex === 0 && (
                                  <Typography variant="button" display="inline">
                                    {viewState.route[legIndex].departureAirport || <Fragment>&mdash;&nbsp;</Fragment>}&nbsp;
                                  </Typography>
                                )}
                                <Typography variant="button" display="inline">
                                  &rarr;&nbsp;{viewState.route[legIndex].arrivalAirport || <Fragment>&nbsp;&mdash;</Fragment>}
                                </Typography>
                              </div>
                              {viewState.tabIndex === 'ALL' && viewState.route.length > 1 && (
                                <Fragment>
                                  &nbsp;&nbsp;&nbsp;&nbsp;
                                  <IconButton
                                    onClick={e => {
                                      e.stopPropagation(); // To prevent unintended click after remove.
                                      setViewState({
                                        ...viewState,
                                        legIndex: Math.min(legIndex, viewState.route.length - 2),
                                        default: {
                                          ...viewState.default,
                                          legs: [...viewState.default.legs.slice(0, legIndex), ...viewState.default.legs.slice(legIndex + 1)]
                                        },
                                        route: [...viewState.route.slice(0, legIndex), ...viewState.route.slice(legIndex + 1)],
                                        days: viewState.days.map(day => ({ ...day, legs: [...day.legs.slice(0, legIndex), ...day.legs.slice(legIndex + 1)] }))
                                      });
                                    }}
                                  >
                                    <ClearIcon />
                                  </IconButton>
                                </Fragment>
                              )}
                            </div>
                          }
                        />
                      ))}
                    </Tabs>

                    {/* Add and return buttons */}
                    {viewState.tabIndex === 'ALL' && (
                      <Fragment>
                        <div>
                          <IconButton
                            onClick={e =>
                              setViewState({
                                ...viewState,
                                legIndex: viewState.route.length,
                                default: {
                                  ...viewState.default,
                                  legs: [...viewState.default.legs, { blockTime: '', stdLowerBound: '', stdUpperBound: '', originPermission: false, destinationPermission: false }]
                                },
                                route: [...viewState.route, { flightNumber: '', departureAirport: viewState.route[viewState.route.length - 1].arrivalAirport, arrivalAirport: '' }],
                                days: viewState.days.map(day => ({
                                  ...day,
                                  legs: [...day.legs, { blockTime: '', stdLowerBound: '', stdUpperBound: '', originPermission: false, destinationPermission: false }]
                                }))
                              })
                            }
                          >
                            <AddIcon />
                          </IconButton>
                        </div>
                        <div className={classes.grow} />
                        <div>
                          <IconButton
                            onClick={e =>
                              setViewState({
                                ...viewState,
                                legIndex: viewState.route.length,
                                default: {
                                  ...viewState.default,
                                  legs: [
                                    ...viewState.default.legs,
                                    ...[...viewState.default.legs]
                                      .reverse()
                                      .map(leg => ({ blockTime: '', stdLowerBound: '', stdUpperBound: '', originPermission: false, destinationPermission: false }))
                                  ]
                                },
                                route: [
                                  ...viewState.route,
                                  ...[...viewState.route].reverse().map(leg => ({ flightNumber: '', departureAirport: leg.arrivalAirport, arrivalAirport: leg.departureAirport }))
                                ],
                                days: viewState.days.map(day => ({
                                  ...day,
                                  legs: [
                                    ...day.legs,
                                    ...[...day.legs]
                                      .reverse()
                                      .map(leg => ({ blockTime: '', stdLowerBound: '', stdUpperBound: '', originPermission: false, destinationPermission: false }))
                                  ]
                                }))
                              })
                            }
                          >
                            <WrapTextIcon />
                          </IconButton>
                        </div>
                      </Fragment>
                    )}
                  </div>

                  {/* Leg content */}
                  <Paper classes={{ root: classes.tabPaper }}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <RefiningTextField
                          fullWidth
                          label="Flight Number"
                          dataType={dataTypes.flightNumber}
                          value={routeLegViewState.flightNumber}
                          onChange={({ target: { value: flightNumber } }) => setViewState({ ...viewState, route: routeButOne(routeLeg => ({ ...routeLeg, flightNumber })) })}
                          disabled={viewState.tabIndex !== 'ALL'}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <RefiningTextField
                          fullWidth
                          label="Departure Airport"
                          dataType={dataTypes.airport}
                          value={routeLegViewState.departureAirport}
                          onChange={({ target: { value: departureAirport } }) =>
                            setViewState({ ...viewState, route: routeButOne(routeLeg => ({ ...routeLeg, departureAirport })) })
                          }
                          disabled={viewState.tabIndex !== 'ALL'}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <RefiningTextField
                          fullWidth
                          label="Arrival Airport"
                          dataType={dataTypes.airport}
                          value={routeLegViewState.arrivalAirport}
                          onChange={({ target: { value: arrivalAirport } }) => setViewState({ ...viewState, route: routeButOne(routeLeg => ({ ...routeLeg, arrivalAirport })) })}
                          disabled={viewState.tabIndex !== 'ALL'}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <RefiningTextField
                          fullWidth
                          label="STD Lower bound"
                          dataType={dataTypes.daytime}
                          value={legViewState.stdLowerBound}
                          onChange={({ target: { value: stdLowerBound } }) =>
                            setViewState(
                              viewState.tabIndex === 'ALL'
                                ? {
                                    ...viewState,
                                    default: { ...viewState.default, legs: allLegsButOne(leg => ({ ...leg, stdLowerBound })) },
                                    days: Weekdays.map(d => ({ ...viewState.days[d], legs: dayLegsButOne(d, leg => ({ ...leg, stdLowerBound })) }))
                                  }
                                : {
                                    ...viewState,
                                    days: daysButOne(viewState.tabIndex, day => ({
                                      ...day,
                                      legs: dayLegsButOne(viewState.tabIndex as Weekday, leg => ({ ...leg, stdLowerBound }))
                                    }))
                                  }
                            )
                          }
                          disabled={viewState.tabIndex !== 'ALL' && !viewState.days[viewState.tabIndex].selected}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <RefiningTextField
                          fullWidth
                          label="STD Upper bound"
                          dataType={dataTypes.daytime}
                          value={legViewState.stdUpperBound}
                          onChange={({ target: { value: stdUpperBound } }) =>
                            setViewState(
                              viewState.tabIndex === 'ALL'
                                ? {
                                    ...viewState,
                                    default: { ...viewState.default, legs: allLegsButOne(leg => ({ ...leg, stdUpperBound })) },
                                    days: Weekdays.map(d => ({ ...viewState.days[d], legs: dayLegsButOne(d, leg => ({ ...leg, stdUpperBound })) }))
                                  }
                                : {
                                    ...viewState,
                                    days: daysButOne(viewState.tabIndex, day => ({
                                      ...day,
                                      legs: dayLegsButOne(viewState.tabIndex as Weekday, leg => ({ ...leg, stdUpperBound }))
                                    }))
                                  }
                            )
                          }
                          disabled={viewState.tabIndex !== 'ALL' && !viewState.days[viewState.tabIndex].selected}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <RefiningTextField
                          fullWidth
                          label="Block Time"
                          dataType={dataTypes.daytime}
                          value={legViewState.blockTime}
                          onChange={({ target: { value: blockTime } }) =>
                            setViewState(
                              viewState.tabIndex === 'ALL'
                                ? {
                                    ...viewState,
                                    default: { ...viewState.default, legs: allLegsButOne(leg => ({ ...leg, blockTime })) },
                                    days: Weekdays.map(d => ({ ...viewState.days[d], legs: dayLegsButOne(d, leg => ({ ...leg, blockTime })) }))
                                  }
                                : {
                                    ...viewState,
                                    days: daysButOne(viewState.tabIndex, day => ({ ...day, legs: dayLegsButOne(viewState.tabIndex as Weekday, leg => ({ ...leg, blockTime })) }))
                                  }
                            )
                          }
                          disabled={viewState.tabIndex !== 'ALL' && !viewState.days[viewState.tabIndex].selected}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <FormControlLabel
                          label="Origin Permission"
                          control={
                            <Checkbox
                              color="primary"
                              checked={legViewState.originPermission}
                              onChange={(e, originPermission) =>
                                setViewState(
                                  viewState.tabIndex === 'ALL'
                                    ? {
                                        ...viewState,
                                        default: { ...viewState.default, legs: allLegsButOne(leg => ({ ...leg, originPermission })) },
                                        days: Weekdays.map(d => ({ ...viewState.days[d], legs: dayLegsButOne(d, leg => ({ ...leg, originPermission })) }))
                                      }
                                    : {
                                        ...viewState,
                                        days: daysButOne(viewState.tabIndex, day => ({
                                          ...day,
                                          legs: dayLegsButOne(viewState.tabIndex as Weekday, leg => ({ ...leg, originPermission }))
                                        }))
                                      }
                                )
                              }
                            />
                          }
                          disabled={viewState.tabIndex !== 'ALL' && !viewState.days[viewState.tabIndex].selected}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <FormControlLabel
                          label="Destination Permission"
                          control={
                            <Checkbox
                              color="primary"
                              checked={legViewState.destinationPermission}
                              onChange={(e, destinationPermission) =>
                                setViewState(
                                  viewState.tabIndex === 'ALL'
                                    ? {
                                        ...viewState,
                                        default: { ...viewState.default, legs: allLegsButOne(leg => ({ ...leg, destinationPermission })) },
                                        days: Weekdays.map(d => ({ ...viewState.days[d], legs: dayLegsButOne(d, leg => ({ ...leg, destinationPermission })) }))
                                      }
                                    : {
                                        ...viewState,
                                        days: daysButOne(viewState.tabIndex, day => ({
                                          ...day,
                                          legs: dayLegsButOne(viewState.tabIndex as Weekday, leg => ({ ...leg, destinationPermission }))
                                        }))
                                      }
                                )
                              }
                            />
                          }
                          disabled={viewState.tabIndex !== 'ALL' && !viewState.days[viewState.tabIndex].selected}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </BaseModal>
  );

  function daysButOne(day: Weekday, dayTabFactory: DayTabViewState | ((day: DayTabViewState) => DayTabViewState)): DayTabViewState[] {
    return [...viewState.days.slice(0, day), typeof dayTabFactory === 'function' ? dayTabFactory(viewState.days[day]) : dayTabFactory, ...viewState.days.slice(day + 1)];
  }
  function routeButOne(routeLegFactory: RouteLegViewState | ((routeLeg: RouteLegViewState) => RouteLegViewState)): RouteLegViewState[] {
    return [
      ...viewState.route.slice(0, viewState.legIndex),
      typeof routeLegFactory === 'function' ? routeLegFactory(viewState.route[viewState.legIndex]) : routeLegFactory,
      ...viewState.route.slice(viewState.legIndex + 1)
    ];
  }
  function allLegsButOne(legFactory: LegViewState | ((leg: LegViewState) => LegViewState)): LegViewState[] {
    return [
      ...viewState.default.legs.slice(0, viewState.legIndex),
      typeof legFactory === 'function' ? legFactory(viewState.default.legs[viewState.legIndex]) : legFactory,
      ...viewState.default.legs.slice(viewState.legIndex + 1)
    ];
  }
  function dayLegsButOne(day: Weekday, legFactory: LegViewState | ((leg: LegViewState) => LegViewState)): LegViewState[] {
    return [
      ...viewState.days[day].legs.slice(0, viewState.legIndex),
      typeof legFactory === 'function' ? legFactory(viewState.days[day].legs[viewState.legIndex]) : legFactory,
      ...viewState.days[day].legs.slice(viewState.legIndex + 1)
    ];
  }
};

export default FlightRequirementModal;

export function useFlightRequirementModalState() {
  return useModalState<FlightRequirementModalState>();
}
