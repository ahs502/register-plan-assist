import React, { FC, useMemo, useContext, Fragment, useState } from 'react';
import { Theme, Typography, Grid, Paper, Tabs, Tab, Checkbox, IconButton, FormControlLabel } from '@material-ui/core';
import { Clear as ClearIcon, Add as AddIcon, WrapText as WrapTextIcon, CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon } from '@material-ui/icons';
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
import {
  ViewState,
  AircraftIdentityOptionViewState,
  RouteLegViewState,
  DayTabViewState,
  LegViewState,
  ViewStateValidation
} from 'src/components/preplan/FlightRequirementModal.types';
import classNames from 'classnames';

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
  },
  error: {
    color: theme.palette.error.main
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
      bypassValidation: true,
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
        aircraftRegister: '',
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
        aircraftRegister: '',
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
    () => {
      if (!flightRequirement) return;
      const flights = preplan.flights.filter(f => f.flightRequirement === flightRequirement);
      const aircraftRegisters = flights.map(f => f.aircraftRegister).distinct();
      const defaultAircraftRegister =
        aircraftRegisters.length !== 1 || !!aircraftRegisters[0]
          ? ''
          : dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).convertBusinessToViewOptional(aircraftRegisters[0]);
      return {
        bypassValidation: false,
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
          aircraftRegister: defaultAircraftRegister,
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
          const flight = flights.find(f => f.day === d);
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
            aircraftRegister:
              sourceDayFlightRequirement && flight
                ? dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).convertBusinessToViewOptional(flight.aircraftRegister)
                : defaultAircraftRegister,
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
      };
    }
  );
  const tabViewState = viewState.tabIndex === 'ALL' ? viewState.default : viewState.days[viewState.tabIndex];
  const routeLegViewState = viewState.route[viewState.legIndex];
  const legViewState = viewState.tabIndex === 'ALL' ? viewState.default.legs[viewState.legIndex] : viewState.days[viewState.tabIndex].legs[viewState.legIndex];

  const validation = new ViewStateValidation(viewState, preplan.aircraftRegisters);
  const errors = {
    label: viewState.bypassValidation ? undefined : validation.message('LABEL_*'),
    category: viewState.bypassValidation ? undefined : validation.message('CATEGORY_*'),
    allTab: viewState.bypassValidation ? false : !validation.$.defaultValidation.ok || !validation.$.routeValidation.every(v => v.ok),
    daySelects: viewState.bypassValidation ? undefined : validation.message('AT_LEAST_SELECT_ONE_DAY'),
    dayTabs: validation.$.dayValidations.map(v => (viewState.bypassValidation ? false : !v.ok)),
    notes: viewState.bypassValidation
      ? undefined
      : viewState.tabIndex === 'ALL'
      ? validation.$.defaultValidation.message('NOTES_*')
      : validation.$.dayValidations[viewState.tabIndex].message('NOTES_*'),
    allowedAircrafts: viewState.bypassValidation
      ? undefined
      : viewState.tabIndex === 'ALL'
      ? validation.$.defaultValidation.message('ALLOWED_AIRCRAFT_IDENTITIES_*')
      : validation.$.dayValidations[viewState.tabIndex].message('ALLOWED_AIRCRAFT_IDENTITIES_*'),
    aircraftRegister: viewState.bypassValidation
      ? undefined
      : viewState.tabIndex === 'ALL'
      ? validation.$.defaultValidation.message('AIRCRAFT_REGISTER_*')
      : validation.$.dayValidations[viewState.tabIndex].message('AIRCRAFT_REGISTER_*'),
    legTabs:
      viewState.tabIndex === 'ALL'
        ? validation.$.defaultValidation.$.legValidations.map((v, index) => (viewState.bypassValidation ? false : !(v.ok && validation.$.routeValidation[index].ok)))
        : validation.$.dayValidations[viewState.tabIndex].$.legValidations.map((v, index) =>
            viewState.bypassValidation ? false : !(v.ok && validation.$.routeValidation[index].ok)
          ),
    flightNumber: viewState.bypassValidation ? undefined : validation.$.routeValidation[viewState.legIndex].message('FLIGHT_NUMBER_*'),
    departureAirport: viewState.bypassValidation ? undefined : validation.$.routeValidation[viewState.legIndex].message('DEPARTURE_AIRPORT_*'),
    arrivalAirport: viewState.bypassValidation ? undefined : validation.$.routeValidation[viewState.legIndex].message('ARRIVAL_AIRPORT_*'),
    stdLowerBound: viewState.bypassValidation
      ? undefined
      : viewState.tabIndex === 'ALL'
      ? validation.$.defaultValidation.$.legValidations[viewState.legIndex].message('STD_LOWER_BOUND_*')
      : validation.$.dayValidations[viewState.tabIndex].$.legValidations[viewState.legIndex].message('STD_LOWER_BOUND_*'),
    stdUpperBound: viewState.bypassValidation
      ? undefined
      : viewState.tabIndex === 'ALL'
      ? validation.$.defaultValidation.$.legValidations[viewState.legIndex].message('STD_UPPER_BOUND_*')
      : validation.$.dayValidations[viewState.tabIndex].$.legValidations[viewState.legIndex].message('STD_UPPER_BOUND_*'),
    blockTime: viewState.bypassValidation
      ? undefined
      : viewState.tabIndex === 'ALL'
      ? validation.$.defaultValidation.$.legValidations[viewState.legIndex].message('BLOCKTIME_*')
      : validation.$.dayValidations[viewState.tabIndex].$.legValidations[viewState.legIndex].message('BLOCKTIME_*')
  };

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      open={open}
      maxWidth="md"
      cancelable={true}
      title={flightRequirement ? 'What are your intended changes?' : 'What is the new flight?'}
      actions={[
        {
          title: 'Cancel'
        },
        {
          title: 'Submit',
          action: async () => {
            viewState.bypassValidation && setViewState({ ...viewState, bypassValidation: false });

            if (!validation.ok) throw 'Invalid form fields.';

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
                // aircraftRegisterId: (new PreplanAircraftSelection(d.aircraftSelection, preplan.aircraftRegisters).backupAircraftRegister || { id: undefined }).id,
                aircraftRegisterId: dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).convertViewToModelOptional(viewState.days[d.day].aircraftRegister),
                legs: d.route.map<FlightLegModel>(l => ({
                  std: l.stdLowerBound
                }))
              }));

            // const flightModels: FlightModel[] = flights.filter(f => newFlightRequirementModel.days.some(d => d.day === f.day)).map(f => f.extractModel());
            const flightModels: FlightModel[] = !flightRequirement
              ? []
              : flights
                  .filter(f => newFlightRequirementModel.days.some(d => d.day === f.day))
                  .map(f =>
                    f.extractModel(flightModel => ({
                      ...flightModel,
                      aircraftRegisterId: dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).convertViewToModelOptional(viewState.days[f.day].aircraftRegister),
                      legs: flightModel.legs.map<FlightLegModel>((l, index) => ({
                        ...l,
                        std: dataTypes.daytime.convertViewToModel(viewState.days[f.day].legs[index].stdLowerBound)
                      }))
                    }))
                  );

            const newPreplanModel = flightRequirement
              ? await FlightRequirementService.edit(preplan.id, { id: flightRequirement.id, ...newFlightRequirementModel }, flightModels, newFlightModels)
              : await FlightRequirementService.add(preplan.id, newFlightRequirementModel, newFlightModels);
            await reloadPreplan(newPreplanModel);
            return others.onClose();
          },
          disabled: !viewState.bypassValidation && !validation.ok
        }
      ]}
    >
      <Grid container spacing={2}>
        {/* General */}
        <Grid item xs={5}>
          <RefiningTextField
            fullWidth
            label="Label"
            dataType={dataTypes.label}
            value={viewState.label}
            onChange={e => setViewState({ ...viewState, label: e.target.value })}
            error={errors.label !== undefined}
            helperText={errors.label}
          />
        </Grid>
        <Grid item xs={5}>
          <RefiningTextField
            fullWidth
            label="Category"
            dataType={dataTypes.name}
            value={viewState.category}
            onChange={e => setViewState({ ...viewState, category: e.target.value })}
            error={errors.category !== undefined}
            helperText={errors.category}
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
                icon={errors.daySelects === undefined ? <CheckBoxOutlineBlankIcon /> : <CheckBoxOutlineBlankIcon color="error" />}
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
                  icon={errors.daySelects === undefined ? <CheckBoxOutlineBlankIcon /> : <CheckBoxOutlineBlankIcon color="error" />}
                  checked={viewState.days[d].selected}
                  onChange={e => setViewState({ ...viewState, days: daysButOne(d, { ...viewState.default, selected: e.target.checked }) })}
                />
              </div>
            ))}
          </Grid>
          <Grid item xs={1}>
            <Tabs value={viewState.tabIndex} onChange={(e, tabIndex) => setViewState({ ...viewState, tabIndex })} variant="fullWidth" orientation="vertical">
              <Tab classes={{ root: classNames(classes.dayTab, { [classes.error]: errors.allTab }) }} value="ALL" label="(All)" />
              {Weekdays.map(d => (
                <Tab
                  key={d}
                  classes={{ root: classNames(classes.dayTab, { [classes.error]: errors.dayTabs[d] }) }}
                  value={d}
                  label={
                    (viewState.days[d].rsx !== viewState.default.rsx ||
                    dataTypes.name.refineView(viewState.days[d].notes) !== dataTypes.name.refineView(viewState.default.notes) ||
                    viewState.days[d].allowedAircraftIdentities.some(i => !viewState.default.allowedAircraftIdentities.includes(i)) ||
                    viewState.default.allowedAircraftIdentities.some(i => !viewState.days[d].allowedAircraftIdentities.includes(i)) ||
                    viewState.days[d].forbiddenAircraftIdentities.some(i => !viewState.default.forbiddenAircraftIdentities.includes(i)) ||
                    viewState.default.forbiddenAircraftIdentities.some(i => !viewState.days[d].forbiddenAircraftIdentities.includes(i)) ||
                    viewState.days[d].legs.some(
                      (l, index) =>
                        dataTypes.daytime.refineView(l.stdLowerBound) !== dataTypes.daytime.refineView(viewState.default.legs[index].stdLowerBound) ||
                        dataTypes.daytime.refineView(l.stdUpperBound) !== dataTypes.daytime.refineView(viewState.default.legs[index].stdUpperBound) ||
                        dataTypes.daytime.refineView(l.blockTime) !== dataTypes.daytime.refineView(viewState.default.legs[index].blockTime) ||
                        l.originPermission !== viewState.default.legs[index].originPermission ||
                        l.destinationPermission !== viewState.default.legs[index].destinationPermission
                    )
                      ? '✱ '
                      : '') + Weekday[d].slice(0, 3)
                  }
                />
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
                    error={errors.notes !== undefined}
                    helperText={errors.notes}
                  />
                </Grid>
                <Grid item xs={5}>
                  <MultiSelect
                    label="Allowed Aircrafts"
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
                    error={errors.allowedAircrafts !== undefined}
                    helperText={errors.allowedAircrafts}
                  ></MultiSelect>
                </Grid>
                <Grid item xs={5}>
                  <MultiSelect
                    label="Forbidden Aircrafts"
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
                <Grid item xs={2}>
                  <RefiningTextField
                    fullWidth
                    label="Register"
                    dataType={dataTypes.preplanAircraftRegister(preplan.aircraftRegisters)}
                    value={tabViewState.aircraftRegister}
                    onChange={({ target: { value: aircraftRegister } }) =>
                      setViewState(
                        viewState.tabIndex === 'ALL'
                          ? { ...viewState, default: { ...viewState.default, aircraftRegister }, days: viewState.days.map(day => ({ ...day, aircraftRegister })) }
                          : {
                              ...viewState,
                              default: {
                                ...viewState.default,
                                aircraftRegister: viewState.days.some(
                                  d =>
                                    dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).refineView(d.aircraftRegister) !==
                                    dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).refineView(aircraftRegister)
                                )
                                  ? ''
                                  : aircraftRegister
                              },
                              days: daysButOne(viewState.tabIndex, day => ({ ...day, aircraftRegister }))
                            }
                      )
                    }
                    disabled={viewState.tabIndex !== 'ALL' && !viewState.days[viewState.tabIndex].selected}
                    error={errors.aircraftRegister !== undefined}
                    helperText={errors.aircraftRegister}
                  />
                </Grid>
                {/* Legs */}
                <Grid item xs={12}>
                  {/* Leg tabs */}
                  <div className={classes.flex}>
                    <Tabs variant="scrollable" scrollButtons="auto" value={viewState.legIndex} onChange={(e, legIndex) => setViewState({ ...viewState, legIndex })}>
                      {tabViewState.legs.map((leg, legIndex) => (
                        <Tab
                          classes={{ root: classNames({ [classes.error]: errors.legTabs[legIndex] }) }}
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
                            disabled={!dataTypes.airport.checkView(viewState.route[viewState.route.length - 1].arrivalAirport)}
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
                            disabled={
                              viewState.route.some(l => !dataTypes.airport.checkView(l.departureAirport) || !dataTypes.airport.checkView(l.arrivalAirport)) ||
                              dataTypes.airport.refineView(viewState.route[0].departureAirport) ===
                                dataTypes.airport.refineView(viewState.route[viewState.route.length - 1].arrivalAirport)
                            }
                            onClick={e => {
                              const path: string[] = [viewState.route[0].departureAirport, ...viewState.route.map(l => l.arrivalAirport)].map(a => dataTypes.airport.refineView(a));
                              loop: for (let i = 1; i <= path.length - 1; i++) {
                                for (let j = 0; j < path.length - i; ++j) if (path[j + i] !== path[path.length - j - 1]) continue loop;
                                const departureAirport = path[i];
                                const arrivalAirport = path[i - 1];
                                setViewState({
                                  ...viewState,
                                  legIndex: viewState.route.length,
                                  default: {
                                    ...viewState.default,
                                    legs: [
                                      ...viewState.default.legs,
                                      { blockTime: '', stdLowerBound: '', stdUpperBound: '', originPermission: false, destinationPermission: false }
                                    ]
                                  },
                                  route: [...viewState.route, { flightNumber: '', departureAirport, arrivalAirport }],
                                  days: viewState.days.map(day => ({
                                    ...day,
                                    legs: [...day.legs, { blockTime: '', stdLowerBound: '', stdUpperBound: '', originPermission: false, destinationPermission: false }]
                                  }))
                                });
                                break loop;
                              }
                            }}
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
                          error={errors.flightNumber !== undefined}
                          helperText={errors.flightNumber}
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
                          error={errors.departureAirport !== undefined}
                          helperText={errors.departureAirport}
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
                          error={errors.arrivalAirport !== undefined}
                          helperText={errors.arrivalAirport}
                        />
                      </Grid>
                      {/* <Grid item xs={4}>
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
                          error={errors.stdLowerBound !== undefined}
                          helperText={errors.stdLowerBound}
                        />
                      </Grid> */}
                      <Grid item xs={4}>
                        <RefiningTextField
                          fullWidth
                          label="STD"
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
                          error={errors.stdLowerBound !== undefined}
                          helperText={errors.stdLowerBound}
                        />
                      </Grid>
                      {/* <Grid item xs={4}>
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
                          error={errors.stdUpperBound !== undefined}
                          helperText={errors.stdUpperBound}
                        />
                      </Grid> */}
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
                          error={errors.blockTime !== undefined}
                          helperText={errors.blockTime}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <RefiningTextField
                          fullWidth
                          label="STA"
                          dataType={dataTypes.daytime}
                          value={
                            dataTypes.daytime.checkView(legViewState.stdLowerBound) && dataTypes.daytime.checkView(legViewState.blockTime)
                              ? dataTypes.daytime.convertModelToView(
                                  dataTypes.daytime.convertViewToModel(legViewState.stdLowerBound) + dataTypes.daytime.convertViewToModel(legViewState.blockTime)
                                )
                              : '—'
                          }
                          disabled
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
