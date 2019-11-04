import React, { FC, useState, useMemo, useContext, Fragment } from 'react';
import { Theme, Typography, Grid, TextField, Paper, Tabs, Tab, Checkbox, Button, IconButton, FormControlLabel } from '@material-ui/core';
import { Clear as ClearIcon, Add as AddIcon, WrapText as WrapTextIcon, ArrowRightAlt as ArrowRightAltIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalViewState, useModalState } from 'src/components/BaseModal';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Weekday, { Weekdays } from '@core/types/Weekday';
import AutoComplete from 'src/components/AutoComplete';
import MultiSelect from 'src/components/MultiSelect';
import MasterData, { Stc } from '@core/master-data';
import Rsx, { Rsxes } from '@core/types/Rsx';
import Id from '@core/types/Id';
import AircraftIdentityType from '@core/types/AircraftIdentityType';
import { PreplanContext, ReloadPreplanContext } from 'src/pages/preplan';
import NewFlightRequirementModel from '@core/models/flight-requirement/NewFlightRequirementModel';
import FlightModel from '@core/models/flight/FlightModel';
import NewFlightModel from '@core/models/flight/NewFlightModel';
import FlightNumber from '@core/types/FlightNumber';
import { parseTime } from 'src/utils/parsers';
import PreplanAircraftSelection from 'src/business/preplan/PreplanAircraftSelection';
import FlightLegModel from '@core/models/flight/FlightLegModel';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';
import FlightRequirementLegModel from '@core/models/flight-requirement/FlightRequirementLegModel';
import DayFlightRequirementModel from '@core/models/flight-requirement/DayFlightRequirementModel';
import Flight from 'src/business/flight/Flight';
import DeepWritablePartial from '@core/types/DeepWritablePartial';
import FlightRequirementService from 'src/services/FlightRequirementService';
import DayFlightRequirementLegModel from '@core/models/flight-requirement/DayFlightRequirementLegModel';

const useStyles = makeStyles((theme: Theme) => ({
  flightRequirementStyle: {
    width: '785px',
    height: '775px',
    padding: '4px',
    margin: '0px',
    '& div.MuiDialogContent-root': {
      padding: '4px 4px'
    },
    '& div.MuiDialogTitle-root': {
      padding: '16px 16px'
    },
    '& div.MuiDialogActions-root': {
      padding: '5px'
    }
  },
  dayTab: {
    minWidth: 70,
    maxWidth: 70
  },
  captionTextColor: {
    color: theme.palette.grey[500]
  },
  flightRequirementLegContainer: {
    // borderBottom: '3px solid gray',
    marginTop: '15px',
    paddingTop: '5px'
  },
  flightRequirementLegContainerPaper: {
    padding: '5px',
    margin: '10px 5px 5px 5px',
    width: '730px',
    maxWidth: '730px'
  },
  flightRequirementLegTabs: {
    padding: '0px 5px',
    margin: '0px 5px'
  },
  flightRequirementLegInfoTextField: {
    // marginTop: '5px'
  },
  flightRequirementLegInfoCheckBox: {
    padding: '5px 0px 0px 5px',
    margin: '0px 20px 0px 0px'
  },
  flightRequirementLegInfoCheckBoxes: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    margin: '5px 0px 0px 0px'
  },
  flightRequirementDaysTextField: {
    padding: '0px 15px 0px 15px',
    margin: '5px 0px 0px 0px'
  },
  flightRequirementInformationTitle: {
    padding: '0px 0px 0px 15px',
    fontSize: '16px'
  },
  flightRequirementInformationTextField: {
    padding: '0px 15px 0px 15px',
    margin: '5px 0px 0px 0px'
  },
  flightRequirementInformationButton: {
    padding: '5px 0px 0px 15px'
  },
  flightRequirementWeekDaysTab: {
    padding: '0px 15px 0px 15px',
    margin: '5px 0px 0px 0px',
    '& > div > div': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center'
    }
  },
  flightRequirementWeekDaySelectionTab: {
    padding: '5px 15px 0px 15px',
    margin: '5px 0px',
    '& h6': {
      padding: '10px 0px 0px 40px',
      margin: '5px 0px'
    },
    '& div ~ div': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between'
    }
    // '& button': {
    //   marginRight: '25px'
    // }
  },
  flightRequirementInformationContainer: {
    marginTop: '5px'
  },
  flightRequirementInformationContainerPaper: {
    margin: '10px',
    padding: '5px 5px',
    width: '750px',
    maxWidth: '750px'
  },
  // flightRequirementLegItems: {
  //   '& span': {

  //   }
  // }
  legsTab: {
    display: 'flex',
    flexDirection: 'row',
    justifyItems: 'center',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    // height: '50px',
    width: '100px',
    minWidth: '90px',
    maxWidth: '100px',
    '&:hover': {
      backgroundColor: '#D3D3D3',
      cursor: 'pointer'
    },
    '&:active': {
      backgroundColor: '#848689'
    }
    // marginRight: '5px'
  },
  legTab: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  legTabButton: {
    display: 'flex',
    margin: '-5px',
    padding: '0px',
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  legTabFlightNumber: {
    color: 'grey',
    fontSize: '10px'
  },
  legTabRightArrow: {
    marginTop: '5px'
  },
  flightRequirementLegInfoContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '5px'
  },
  flightRequirementLegInfoTexFields: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    '& div > div': {
      width: '215px'
    }
  },
  addButton: {
    width: '35px',
    height: '35px',
    minWidth: '20px',
    minHeight: '20px',
    margin: '5px 5px 5px 5px'
  },
  addIcon: {
    minHeight: '10px',
    minWidth: '10px'
  },
  clearButton: {
    height: '25px',
    width: '25px',
    color: '#EEEEEE',
    marginLeft: '5px',
    padding: '1px 10px 0px 10px',
    '&:active': {
      backgroundColor: 'transparent'
    },
    '&:focus': {
      backgroundColor: 'transparent'
    },
    '&:target': {
      backgroundColor: 'transparent'
    }
  },
  clearIcon: {
    width: '16px',
    height: '16px'
  }
}));

interface ViewState {
  label: string;
  category: string;
  stc: Stc;
  tabIndex: 'ALL' | Weekday;
  legIndex: number;
  default: TabViewState;
  route: RouteLegViewState[];
  days: DayTabViewState[];
}
interface TabViewState {
  rsx: Rsx;
  notes: string;
  allowedAircraftIdentities: readonly AircraftIdentityOptionViewState[];
  forbiddenAircraftIdentities: readonly AircraftIdentityOptionViewState[];
  legs: LegViewState[];
}
interface DayTabViewState extends TabViewState {
  selected: boolean;
}
interface RouteLegViewState {
  originalIndex?: number;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
}
interface LegViewState {
  blockTime: string;
  stdLowerBound: string;
  stdUpperBound: string;
  originPermission: boolean;
  destinationPermission: boolean;
}
interface AircraftIdentityOptionViewState {
  id: Id;
  name: string;
  type: AircraftIdentityType;
  entityId: Id;
}

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

  const [viewState, setViewState] = useModalViewState<ViewState>(
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
        label: flightRequirement.label,
        category: flightRequirement.category,
        stc: flightRequirement.stc,
        tabIndex: day === undefined ? 'ALL' : day,
        legIndex: 0,
        default: {
          rsx: flightRequirement.rsx,
          notes: flightRequirement.notes,
          allowedAircraftIdentities: flightRequirement.aircraftSelection.includedIdentities.map(
            i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
          ),
          forbiddenAircraftIdentities: flightRequirement.aircraftSelection.excludedIdentities.map(
            i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
          ),
          legs: flightRequirement.route.map<LegViewState>(l => ({
            blockTime: String(l.blockTime),
            stdLowerBound: l.stdLowerBound.toString('HHmm', true),
            stdUpperBound: l.stdUpperBound === undefined ? '' : l.stdUpperBound.toString('HHmm', true),
            originPermission: l.originPermission,
            destinationPermission: l.destinationPermission
          }))
        },
        route: flightRequirement.route.map<RouteLegViewState>((l, index) => ({
          originalIndex: index,
          flightNumber: l.flightNumber.standardFormat,
          departureAirport: l.departureAirport.name,
          arrivalAirport: l.arrivalAirport.name
        })),
        days: Weekdays.map<DayTabViewState>(d => {
          const sourceDayFlightRequirement = flightRequirement.days.find(x => x.day === d);
          return {
            selected: !!sourceDayFlightRequirement,
            rsx: sourceDayFlightRequirement ? sourceDayFlightRequirement.rsx : flightRequirement.rsx,
            notes: sourceDayFlightRequirement ? sourceDayFlightRequirement.notes : flightRequirement.notes,
            allowedAircraftIdentities: (sourceDayFlightRequirement ? sourceDayFlightRequirement.aircraftSelection : flightRequirement.aircraftSelection).includedIdentities.map(
              i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
            ),
            forbiddenAircraftIdentities: (sourceDayFlightRequirement ? sourceDayFlightRequirement.aircraftSelection : flightRequirement.aircraftSelection).excludedIdentities.map(
              i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
            ),
            legs: sourceDayFlightRequirement
              ? sourceDayFlightRequirement.route.map<LegViewState>(l => ({
                  blockTime: String(l.blockTime),
                  stdLowerBound: l.stdLowerBound.toString('HHmm', true),
                  stdUpperBound: l.stdUpperBound === undefined ? '' : l.stdUpperBound.toString('HHmm', true),
                  originPermission: l.originPermission,
                  destinationPermission: l.destinationPermission
                }))
              : flightRequirement.route.map<LegViewState>(l => ({
                  blockTime: String(l.blockTime),
                  stdLowerBound: l.stdLowerBound.toString('HHmm', true),
                  stdUpperBound: l.stdUpperBound === undefined ? '' : l.stdUpperBound.toString('HHmm', true),
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
      maxWidth={false}
      PaperProps={{ className: classes.flightRequirementStyle }}
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
              label: viewState.label.trim().toUpperCase(),
              category: viewState.category.trim(),
              stcId: viewState.stc.id,
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
              notes: viewState.default.notes,
              ignored: flightRequirement ? flightRequirement.ignored : false,
              route: viewState.default.legs.map<FlightRequirementLegModel>((l, index) => ({
                flightNumber: new FlightNumber(viewState.route[index].flightNumber).standardFormat,
                departureAirportId: MasterData.all.airports.name[viewState.route[index].departureAirport.toUpperCase()].id,
                arrivalAirportId: MasterData.all.airports.name[viewState.route[index].arrivalAirport.toUpperCase()].id,
                blockTime: parseTime(l.blockTime)!,
                stdLowerBound: parseTime(l.stdLowerBound)!,
                stdUpperBound: parseTime(l.stdUpperBound),
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
                    notes: d.notes,
                    route: d.legs.map<DayFlightRequirementLegModel>(l => ({
                      blockTime: parseTime(l.blockTime)!,
                      stdLowerBound: parseTime(l.stdLowerBound)!,
                      stdUpperBound: parseTime(l.stdUpperBound),
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

            const flightModels: FlightModel[] = flights
              .filter(f => newFlightRequirementModel.days.some(d => d.day === f.day))
              .map(f =>
                f.extractModel({
                  legs: newFlightRequirementModel.days
                    .find(d => d.day === f.day)!
                    .route.map<DeepWritablePartial<FlightLegModel>>((l, index) => ({
                      std: viewState.route[index].originalIndex === undefined ? l.stdLowerBound : f.legs[viewState.route[index].originalIndex!].std.minutes
                    }))
                })
              );

            const newPreplanModel = flightRequirement
              ? await FlightRequirementService.edit(preplan.id, { id: flightRequirement.id, ...newFlightRequirementModel }, flightModels, newFlightModels)
              : await FlightRequirementService.add(preplan.id, newFlightRequirementModel, newFlightModels);
            await reloadPreplan(newPreplanModel);
            return others.onClose();
          }
        }
      ]}
    >
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="caption" className={classes.flightRequirementInformationTitle}>
            Flight Information
          </Typography>
        </Grid>
        <Grid item xs={5} className={classes.flightRequirementInformationTextField}>
          <TextField fullWidth label="Label" value={viewState.label} onChange={e => setViewState({ ...viewState, label: e.target.value })} />
        </Grid>
        <Grid item xs={5} className={classes.flightRequirementInformationTextField}>
          <TextField fullWidth label="Category" value={viewState.category} onChange={e => setViewState({ ...viewState, category: e.target.value })} />
        </Grid>
        <Grid item xs={2} className={classes.flightRequirementInformationTextField}>
          <AutoComplete
            options={MasterData.all.stcs.items}
            label="Stc"
            getOptionLabel={l => l.name}
            getOptionValue={l => l.id}
            value={viewState.stc}
            onSelect={stc => setViewState({ ...viewState, stc })}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper className={classes.flightRequirementInformationContainerPaper}>
            <Tabs className={classes.flightRequirementWeekDaysTab} value={viewState.tabIndex} onChange={(event, tabIndex) => setViewState({ ...viewState, tabIndex })}>
              <Tab
                className={classes.dayTab}
                value="ALL"
                component={React.forwardRef<HTMLDivElement>((props, ref) => (
                  <div {...props} ref={ref}>
                    <Checkbox
                      indeterminate={viewState.days.some(d => d.selected) && !viewState.days.every(d => d.selected)}
                      checked={viewState.days.every(d => d.selected)}
                      onChange={e => {
                        const selected = !viewState.days.every(d => d.selected);
                        setViewState({ ...viewState, days: Weekdays.map(d => ({ ...viewState.default, selected })) });
                      }}
                      color="primary"
                    />
                    All
                  </div>
                ))}
              />
              {Weekdays.map(d => (
                <Tab
                  key={d}
                  className={classes.dayTab}
                  value={d}
                  component={React.forwardRef<HTMLDivElement>((props, ref) => (
                    <div {...props} ref={ref}>
                      <Checkbox
                        checked={viewState.days[d].selected}
                        onChange={e => setViewState({ ...viewState, days: daysButOne(d, { ...viewState.default, selected: e.target.checked }) })}
                      />
                      {Weekday[d].slice(0, 3)}
                    </div>
                  ))}
                />
              ))}
            </Tabs>

            <Grid item xs={12} className={classes.flightRequirementInformationContainer}>
              <Grid container>
                <Grid item xs={2} className={classes.flightRequirementDaysTextField}>
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
                    disabled={viewState.tabIndex !== 'ALL' && !viewState.days[viewState.tabIndex].selected}
                  />
                </Grid>
                <Grid item xs={8} className={classes.flightRequirementDaysTextField}>
                  <TextField
                    fullWidth
                    label="Notes"
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

                <Grid item xs={6} className={classes.flightRequirementDaysTextField}>
                  <Typography variant="caption" className={classes.captionTextColor}>
                    Allowed Aircrafts
                  </Typography>
                </Grid>
                <Grid item xs={6} className={classes.flightRequirementDaysTextField}>
                  <Typography variant="caption" className={classes.captionTextColor}>
                    Forbidden Aircrafts
                  </Typography>
                </Grid>
                <Grid item xs={6} className={classes.flightRequirementDaysTextField}>
                  <MultiSelect
                    options={aircraftIdentityOptions}
                    getOptionLabel={l => l.name}
                    getOptionValue={l => l.id}
                    value={tabViewState.allowedAircraftIdentities}
                    onSelect={allowedAircraftIdentities =>
                      setViewState(
                        viewState.tabIndex === 'ALL'
                          ? { ...viewState, default: { ...viewState.default, allowedAircraftIdentities }, days: viewState.days.map(day => ({ ...day, allowedAircraftIdentities })) }
                          : { ...viewState, days: daysButOne(viewState.tabIndex, day => ({ ...day, allowedAircraftIdentities })) }
                      )
                    }
                    isDisabled={viewState.tabIndex !== 'ALL' && !viewState.days[viewState.tabIndex].selected}
                  ></MultiSelect>
                </Grid>
                <Grid item xs={6} className={classes.flightRequirementDaysTextField}>
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
                              default: { ...viewState.default, forbiddenAircraftIdentities },
                              days: viewState.days.map(day => ({ ...day, forbiddenAircraftIdentities }))
                            }
                          : { ...viewState, days: daysButOne(viewState.tabIndex, day => ({ ...day, forbiddenAircraftIdentities })) }
                      )
                    }
                    isDisabled={viewState.tabIndex !== 'ALL' && !viewState.days[viewState.tabIndex].selected}
                  ></MultiSelect>
                </Grid>

                <Paper className={classes.flightRequirementLegContainerPaper}>
                  <Grid item xs={12} className={classes.flightRequirementLegContainer}>
                    <Grid container className={classes.flightRequirementLegTabs}>
                      <Grid item xs={11}>
                        <Tabs variant="scrollable" scrollButtons="auto" value={viewState.legIndex} onChange={(e, legIndex) => setViewState({ ...viewState, legIndex })}>
                          {tabViewState.legs.map((leg, legIndex) => (
                            <Tab
                              key={legIndex}
                              component={React.forwardRef<HTMLDivElement>((props, ref) => (
                                <div {...props} ref={ref} className={classes.legsTab}>
                                  <div className={classes.legTab}>
                                    <Typography className={classes.legTabFlightNumber}>
                                      {viewState.route[legIndex].flightNumber || <Fragment>&ndash; &ndash; &ndash;</Fragment>}
                                    </Typography>
                                    <Button className={classes.legTabButton}>
                                      {legIndex === 0 && <Typography variant="caption">{viewState.route[legIndex].departureAirport || <Fragment>&mdash;</Fragment>}</Typography>}
                                      <Typography variant="caption">
                                        <ArrowRightAltIcon className={classes.legTabRightArrow} />
                                      </Typography>
                                      <Typography variant="caption">{viewState.route[legIndex].arrivalAirport || <Fragment>&mdash;</Fragment>}</Typography>
                                    </Button>
                                  </div>
                                  {legIndex > 0 && viewState.tabIndex === 'ALL' && (
                                    <IconButton
                                      className={classes.clearButton}
                                      onClick={e => {
                                        e.stopPropagation(); // To prevent unintended click after remove.
                                        setViewState({
                                          ...viewState,
                                          legIndex: Math.min(legIndex, viewState.route.length - 1),
                                          default: {
                                            ...viewState.default,
                                            legs: [...viewState.default.legs.slice(0, legIndex - 1), ...viewState.default.legs.slice(legIndex + 1)]
                                          },
                                          route: [...viewState.route.slice(0, legIndex - 1), ...viewState.route.slice(legIndex + 1)],
                                          days: viewState.days.map(day => ({ ...day, legs: [...day.legs.slice(0, legIndex - 1), ...day.legs.slice(legIndex + 1)] }))
                                        });
                                      }}
                                    >
                                      <ClearIcon className={classes.clearIcon} />
                                    </IconButton>
                                  )}
                                </div>
                              ))}
                            />
                          ))}
                          {viewState.tabIndex === 'ALL' && (
                            <Tab
                              className={classes.addButton}
                              component={React.forwardRef<HTMLButtonElement>((props, ref) => (
                                <IconButton
                                  {...props}
                                  ref={ref}
                                  onClick={e =>
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
                                      route: [
                                        ...viewState.route,
                                        { flightNumber: '', departureAirport: viewState.route[viewState.route.length - 1].arrivalAirport, arrivalAirport: '' }
                                      ],
                                      days: viewState.days.map(day => ({
                                        ...day,
                                        legs: [...day.legs, { blockTime: '', stdLowerBound: '', stdUpperBound: '', originPermission: false, destinationPermission: false }]
                                      }))
                                    })
                                  }
                                >
                                  <AddIcon className={classes.addIcon} />
                                </IconButton>
                              ))}
                            ></Tab>
                          )}
                        </Tabs>
                      </Grid>
                      <Grid item xs={1}>
                        {viewState.tabIndex === 'ALL' && (
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
                        )}
                      </Grid>
                    </Grid>

                    <Grid container className={classes.flightRequirementLegInfoContainer}>
                      <Grid item xs={12} className={classes.flightRequirementLegInfoTexFields}>
                        <TextField
                          className={classes.flightRequirementLegInfoTextField}
                          label="Flight Number"
                          value={routeLegViewState.flightNumber}
                          onChange={({ target: { value: flightNumber } }) => setViewState({ ...viewState, route: routeButOne(routeLeg => ({ ...routeLeg, flightNumber })) })}
                          disabled={viewState.tabIndex !== 'ALL'}
                        />
                        <TextField
                          className={classes.flightRequirementLegInfoTextField}
                          label="Departure Airport"
                          value={routeLegViewState.departureAirport}
                          onChange={({ target: { value: departureAirport } }) =>
                            setViewState({ ...viewState, route: routeButOne(routeLeg => ({ ...routeLeg, departureAirport })) })
                          }
                          disabled={viewState.tabIndex !== 'ALL'}
                        />
                        <TextField
                          className={classes.flightRequirementLegInfoTextField}
                          label="Arrival Airport"
                          value={routeLegViewState.arrivalAirport}
                          onChange={({ target: { value: arrivalAirport } }) => setViewState({ ...viewState, route: routeButOne(routeLeg => ({ ...routeLeg, arrivalAirport })) })}
                          disabled={viewState.tabIndex !== 'ALL'}
                        />
                      </Grid>
                      <Grid item xs={12} className={classes.flightRequirementLegInfoTexFields}>
                        <TextField
                          className={classes.flightRequirementLegInfoTextField}
                          label="Block Time"
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
                        <TextField
                          className={classes.flightRequirementLegInfoTextField}
                          label="STD Lower bound"
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
                        <TextField
                          className={classes.flightRequirementLegInfoTextField}
                          label="STD Upper bound"
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
                      <Grid item xs={12} className={classes.flightRequirementLegInfoCheckBoxes}>
                        <FormControlLabel
                          className={classes.flightRequirementLegInfoCheckBox}
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
                        <FormControlLabel
                          className={classes.flightRequirementLegInfoCheckBox}
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
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
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
