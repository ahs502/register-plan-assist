import React, { FC, useState, useMemo, useContext } from 'react';
import { Theme, Typography, Grid, TextField, Paper, Tabs, Tab, Checkbox, Button, IconButton, FormControlLabel } from '@material-ui/core';
import { Clear as ClearIcon, Add as AddIcon, WrapText as WrapTextIcon, ArrowRightAlt as ArrowRightAltIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import ModalBase, { ModalBaseProps, ModalBaseModel } from 'src/components/ModalBase';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Weekday, { Weekdays } from '@core/types/Weekday';
import AutoComplete from 'src/components/AutoComplete';
import MultiSelect from 'src/components/MultiSelect';
import MasterData, { Stc } from '@core/master-data';
import Rsx, { Rsxes } from '@core/types/Rsx';
import Id from '@core/types/Id';
import AircraftIdentityType from '@core/types/AircraftIdentityType';
import { PreplanContext } from 'src/pages/preplan';
import NewFlightRequirementModel from '@core/models/flight-requirement/NewFlightRequirementModel';

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

interface ViewModel {
  label: string;
  category: string;
  stc: Stc;
  tabIndex: 'ALL' | Weekday;
  legIndex: number;
  all: TabViewModel;
  route: RouteLegViewModel[];
  days: DayTabViewModel[];
}
interface TabViewModel {
  rsx: Rsx;
  notes: string;
  allowedAircraftIdentities: readonly AircraftIdentityOptionViewModel[];
  forbiddenAircraftIdentities: readonly AircraftIdentityOptionViewModel[];
  legs: LegViewModel[];
}
interface DayTabViewModel extends TabViewModel {
  selected: boolean;
}
interface RouteLegViewModel {
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
}
interface LegViewModel {
  blockTime: string;
  stdLowerBound: string;
  stdUpperBound: string;
  originPermission: boolean;
  destinationPermission: boolean;
}
interface AircraftIdentityOptionViewModel {
  id: Id;
  name: string;
  type: AircraftIdentityType;
  entityId: Id;
}

export interface FlightRequirementModalModel extends ModalBaseModel {
  sourceFlightRequirement?: FlightRequirement;
  day?: Weekday;
}

export interface FlightRequirementModalProps extends ModalBaseProps<FlightRequirementModalModel> {
  onApply(newFlightRequirementModel: NewFlightRequirementModel): void;
}

const FlightRequirementModal: FC<FlightRequirementModalProps> = ({ onApply, ...others }) => {
  const { sourceFlightRequirement, day } = others.model;

  const preplan = useContext(PreplanContext);

  const rsxOptions = useMemo(() => Rsxes.map(r => ({ name: r })), []);
  const aircraftIdentityOptions = useMemo<AircraftIdentityOptionViewModel[]>(
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

  const [viewModel, setViewModel] = useState<ViewModel>(() =>
    sourceFlightRequirement
      ? {
          label: sourceFlightRequirement.label,
          category: sourceFlightRequirement.category,
          stc: sourceFlightRequirement.stc,
          tabIndex: day === undefined ? 'ALL' : day,
          legIndex: 0,
          all: {
            rsx: sourceFlightRequirement.rsx,
            notes: sourceFlightRequirement.notes,
            allowedAircraftIdentities: sourceFlightRequirement.aircraftSelection.includedIdentities.map(
              i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
            ),
            forbiddenAircraftIdentities: sourceFlightRequirement.aircraftSelection.excludedIdentities.map(
              i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
            ),
            legs: sourceFlightRequirement.route.map(l => ({
              blockTime: String(l.blockTime),
              stdLowerBound: l.stdLowerBound.toString(true),
              stdUpperBound: l.stdUpperBound === undefined ? '' : l.stdUpperBound.toString(true),
              originPermission: l.originPermission,
              destinationPermission: l.destinationPermission
            }))
          },
          route: sourceFlightRequirement.route.map(l => ({
            flightNumber: l.flightNumber.standardFormat,
            departureAirport: l.departureAirport.name,
            arrivalAirport: l.arrivalAirport.name
          })),
          days: Weekdays.map(d => {
            const sourceDayFlightRequirement = sourceFlightRequirement.days.find(x => x.day === d);
            return {
              selected: !!sourceDayFlightRequirement,
              rsx: sourceDayFlightRequirement ? sourceDayFlightRequirement.rsx : sourceFlightRequirement.rsx,
              notes: sourceDayFlightRequirement ? sourceDayFlightRequirement.notes : sourceFlightRequirement.notes,
              allowedAircraftIdentities: (sourceDayFlightRequirement
                ? sourceDayFlightRequirement.aircraftSelection
                : sourceFlightRequirement.aircraftSelection
              ).includedIdentities.map(i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!),
              forbiddenAircraftIdentities: (sourceDayFlightRequirement
                ? sourceDayFlightRequirement.aircraftSelection
                : sourceFlightRequirement.aircraftSelection
              ).excludedIdentities.map(i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!),
              legs: sourceDayFlightRequirement
                ? sourceDayFlightRequirement.route.map(l => ({
                    blockTime: String(l.blockTime),
                    stdLowerBound: l.stdLowerBound.toString(true),
                    stdUpperBound: l.stdUpperBound === undefined ? '' : l.stdUpperBound.toString(true),
                    originPermission: l.originPermission,
                    destinationPermission: l.destinationPermission
                  }))
                : sourceFlightRequirement.route.map(l => ({
                    blockTime: String(l.blockTime),
                    stdLowerBound: l.stdLowerBound.toString(true),
                    stdUpperBound: l.stdUpperBound === undefined ? '' : l.stdUpperBound.toString(true),
                    originPermission: l.originPermission,
                    destinationPermission: l.destinationPermission
                  }))
            };
          })
        }
      : {
          label: '',
          category: '',
          stc: MasterData.all.stcs.items.find(s => s.name === 'J')!,
          tabIndex: 'ALL',
          legIndex: 0,
          all: {
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
          days: Weekdays.map(d => ({
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
        }
  );
  const tabViewModel = viewModel.tabIndex === 'ALL' ? viewModel.all : viewModel.days[viewModel.tabIndex];
  const routeLegViewModel = viewModel.route[viewModel.legIndex];
  const legViewModel = viewModel.tabIndex === 'ALL' ? viewModel.all.legs[viewModel.legIndex] : viewModel.days[viewModel.tabIndex].legs[viewModel.legIndex];

  const classes = useStyles();

  return (
    <ModalBase
      {...others}
      maxWidth={false}
      PaperProps={{ className: classes.flightRequirementStyle }}
      cancelable={true}
      title={sourceFlightRequirement ? 'What are your intended changes?' : 'What is the new flight requirement?'}
      actions={[
        {
          title: 'Cancel'
        },
        {
          title: 'Submit',
          action: () => {
            // onApply({});
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
          <TextField fullWidth label="Label" value={viewModel.label} onChange={e => setViewModel({ ...viewModel, label: e.target.value })} />
        </Grid>
        <Grid item xs={5} className={classes.flightRequirementInformationTextField}>
          <TextField fullWidth label="Category" value={viewModel.category} onChange={e => setViewModel({ ...viewModel, category: e.target.value })} />
        </Grid>
        <Grid item xs={2} className={classes.flightRequirementInformationTextField}>
          <AutoComplete
            options={MasterData.all.stcs.items}
            label="Stc"
            getOptionLabel={l => l.name}
            getOptionValue={l => l.id}
            value={viewModel.stc}
            onSelect={stc => setViewModel({ ...viewModel, stc })}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper className={classes.flightRequirementInformationContainerPaper}>
            <Tabs className={classes.flightRequirementWeekDaysTab} value={viewModel.tabIndex} onChange={(event, tabIndex) => setViewModel({ ...viewModel, tabIndex })}>
              <Tab
                className={classes.dayTab}
                value="ALL"
                component={React.forwardRef<HTMLDivElement>((props, ref) => (
                  <div {...props} ref={ref}>
                    <Checkbox
                      indeterminate={viewModel.days.some(d => d.selected) && !viewModel.days.every(d => d.selected)}
                      checked={viewModel.days.every(d => d.selected)}
                      onChange={e => {
                        const selected = !viewModel.days.every(d => d.selected);
                        setViewModel({ ...viewModel, days: Weekdays.map(d => ({ ...viewModel.all, selected })) });
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
                        checked={viewModel.days[d].selected}
                        onChange={e => setViewModel({ ...viewModel, days: daysButOne(d, { ...viewModel.all, selected: e.target.checked }) })}
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
                    value={rsxOptions.find(o => o.name === tabViewModel.rsx)}
                    onSelect={({ name: rsx }) =>
                      setViewModel(
                        viewModel.tabIndex === 'ALL'
                          ? { ...viewModel, all: { ...viewModel.all, rsx }, days: viewModel.days.map(day => ({ ...day, rsx })) }
                          : { ...viewModel, days: daysButOne(viewModel.tabIndex, day => ({ ...day, rsx })) }
                      )
                    }
                    disabled={viewModel.tabIndex !== 'ALL' && !viewModel.days[viewModel.tabIndex].selected}
                  />
                </Grid>
                <Grid item xs={8} className={classes.flightRequirementDaysTextField}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={tabViewModel.notes}
                    onChange={({ target: { value: notes } }) =>
                      setViewModel(
                        viewModel.tabIndex === 'ALL'
                          ? { ...viewModel, all: { ...viewModel.all, notes }, days: viewModel.days.map(day => ({ ...day, notes })) }
                          : { ...viewModel, days: daysButOne(viewModel.tabIndex, day => ({ ...day, notes })) }
                      )
                    }
                    disabled={viewModel.tabIndex !== 'ALL' && !viewModel.days[viewModel.tabIndex].selected}
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
                    value={tabViewModel.allowedAircraftIdentities}
                    onSelect={allowedAircraftIdentities =>
                      setViewModel(
                        viewModel.tabIndex === 'ALL'
                          ? { ...viewModel, all: { ...viewModel.all, allowedAircraftIdentities }, days: viewModel.days.map(day => ({ ...day, allowedAircraftIdentities })) }
                          : { ...viewModel, days: daysButOne(viewModel.tabIndex, day => ({ ...day, allowedAircraftIdentities })) }
                      )
                    }
                    isDisabled={viewModel.tabIndex !== 'ALL' && !viewModel.days[viewModel.tabIndex].selected}
                  ></MultiSelect>
                </Grid>
                <Grid item xs={6} className={classes.flightRequirementDaysTextField}>
                  <MultiSelect
                    options={aircraftIdentityOptions}
                    getOptionLabel={l => l.name}
                    getOptionValue={l => l.id}
                    value={tabViewModel.forbiddenAircraftIdentities}
                    onSelect={forbiddenAircraftIdentities =>
                      setViewModel(
                        viewModel.tabIndex === 'ALL'
                          ? { ...viewModel, all: { ...viewModel.all, forbiddenAircraftIdentities }, days: viewModel.days.map(day => ({ ...day, forbiddenAircraftIdentities })) }
                          : { ...viewModel, days: daysButOne(viewModel.tabIndex, day => ({ ...day, forbiddenAircraftIdentities })) }
                      )
                    }
                    isDisabled={viewModel.tabIndex !== 'ALL' && !viewModel.days[viewModel.tabIndex].selected}
                  ></MultiSelect>
                </Grid>

                <Paper className={classes.flightRequirementLegContainerPaper}>
                  <Grid item xs={12} className={classes.flightRequirementLegContainer}>
                    <Grid container className={classes.flightRequirementLegTabs}>
                      <Grid item xs={11}>
                        <Tabs variant="scrollable" scrollButtons="auto" value={viewModel.legIndex} onChange={(e, legIndex) => setViewModel({ ...viewModel, legIndex })}>
                          {tabViewModel.legs.map((leg, legIndex) => (
                            <Tab
                              key={legIndex}
                              component={React.forwardRef<HTMLDivElement>((props, ref) => (
                                <div {...props} ref={ref} className={classes.legsTab}>
                                  <div className={classes.legTab}>
                                    <Typography className={classes.legTabFlightNumber}>{routeLegViewModel.flightNumber || '&ndash;&ndash;&ndash;'}</Typography>
                                    <Button className={classes.legTabButton}>
                                      {legIndex === 0 && <Typography variant="caption">{viewModel.route[legIndex].departureAirport || '&mdash;'}</Typography>}
                                      <Typography variant="caption">
                                        <ArrowRightAltIcon className={classes.legTabRightArrow} />
                                      </Typography>
                                      <Typography variant="caption">{viewModel.route[legIndex].arrivalAirport || '&mdash;'}</Typography>
                                    </Button>
                                  </div>
                                  {legIndex > 0 && viewModel.tabIndex === 'ALL' && (
                                    <IconButton
                                      className={classes.clearButton}
                                      onClick={e => {
                                        e.stopPropagation(); // To prevent unintended click after remove.
                                        setViewModel({
                                          ...viewModel,
                                          legIndex: Math.min(legIndex, viewModel.route.length - 1),
                                          all: {
                                            ...viewModel.all,
                                            legs: [...viewModel.all.legs.slice(0, legIndex - 1), ...viewModel.all.legs.slice(legIndex + 1)]
                                          },
                                          route: [...viewModel.route.slice(0, legIndex - 1), ...viewModel.route.slice(legIndex + 1)],
                                          days: viewModel.days.map(day => ({ ...day, legs: [...day.legs.slice(0, legIndex - 1), ...day.legs.slice(legIndex + 1)] }))
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
                          {viewModel.tabIndex === 'ALL' && (
                            <Tab
                              className={classes.addButton}
                              component={React.forwardRef<HTMLButtonElement>((props, ref) => (
                                <IconButton
                                  {...props}
                                  ref={ref}
                                  onClick={e =>
                                    setViewModel({
                                      ...viewModel,
                                      legIndex: viewModel.route.length,
                                      all: {
                                        ...viewModel.all,
                                        legs: [
                                          ...viewModel.all.legs,
                                          { blockTime: '', stdLowerBound: '', stdUpperBound: '', originPermission: false, destinationPermission: false }
                                        ]
                                      },
                                      route: [
                                        ...viewModel.route,
                                        { flightNumber: '', departureAirport: viewModel.route[viewModel.route.length - 1].arrivalAirport, arrivalAirport: '' }
                                      ],
                                      days: viewModel.days.map(day => ({
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
                        {viewModel.tabIndex === 'ALL' && (
                          <IconButton
                            onClick={e =>
                              setViewModel({
                                ...viewModel,
                                legIndex: viewModel.route.length,
                                all: {
                                  ...viewModel.all,
                                  legs: [
                                    ...viewModel.all.legs,
                                    ...[...viewModel.all.legs]
                                      .reverse()
                                      .map(leg => ({ blockTime: '', stdLowerBound: '', stdUpperBound: '', originPermission: false, destinationPermission: false }))
                                  ]
                                },
                                route: [
                                  ...viewModel.route,
                                  ...[...viewModel.route].reverse().map(leg => ({ flightNumber: '', departureAirport: leg.arrivalAirport, arrivalAirport: leg.departureAirport }))
                                ],
                                days: viewModel.days.map(day => ({
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
                          value={routeLegViewModel.flightNumber}
                          onChange={({ target: { value: flightNumber } }) => setViewModel({ ...viewModel, route: routeButOne(routeLeg => ({ ...routeLeg, flightNumber })) })}
                          disabled={viewModel.tabIndex !== 'ALL'}
                        />
                        <TextField
                          className={classes.flightRequirementLegInfoTextField}
                          label="Departure Airport"
                          value={routeLegViewModel.departureAirport}
                          onChange={({ target: { value: departureAirport } }) =>
                            setViewModel({ ...viewModel, route: routeButOne(routeLeg => ({ ...routeLeg, departureAirport })) })
                          }
                          disabled={viewModel.tabIndex !== 'ALL'}
                        />
                        <TextField
                          className={classes.flightRequirementLegInfoTextField}
                          label="Arrival Airport"
                          value={routeLegViewModel.arrivalAirport}
                          onChange={({ target: { value: arrivalAirport } }) => setViewModel({ ...viewModel, route: routeButOne(routeLeg => ({ ...routeLeg, arrivalAirport })) })}
                          disabled={viewModel.tabIndex !== 'ALL'}
                        />
                      </Grid>
                      <Grid item xs={12} className={classes.flightRequirementLegInfoTexFields}>
                        <TextField
                          className={classes.flightRequirementLegInfoTextField}
                          label="Block Time"
                          value={legViewModel.blockTime}
                          onChange={({ target: { value: blockTime } }) =>
                            setViewModel(
                              viewModel.tabIndex === 'ALL'
                                ? {
                                    ...viewModel,
                                    all: { ...viewModel.all, legs: allLegsButOne(leg => ({ ...leg, blockTime })) },
                                    days: Weekdays.map(d => ({ ...viewModel.days[d], legs: dayLegsButOne(d, leg => ({ ...leg, blockTime })) }))
                                  }
                                : {
                                    ...viewModel,
                                    days: daysButOne(viewModel.tabIndex, day => ({ ...day, legs: dayLegsButOne(viewModel.tabIndex as Weekday, leg => ({ ...leg, blockTime })) }))
                                  }
                            )
                          }
                          disabled={viewModel.tabIndex !== 'ALL' && !viewModel.days[viewModel.tabIndex].selected}
                        />
                        <TextField
                          className={classes.flightRequirementLegInfoTextField}
                          label="STD Lower bound"
                          value={legViewModel.stdLowerBound}
                          onChange={({ target: { value: stdLowerBound } }) =>
                            setViewModel(
                              viewModel.tabIndex === 'ALL'
                                ? {
                                    ...viewModel,
                                    all: { ...viewModel.all, legs: allLegsButOne(leg => ({ ...leg, stdLowerBound })) },
                                    days: Weekdays.map(d => ({ ...viewModel.days[d], legs: dayLegsButOne(d, leg => ({ ...leg, stdLowerBound })) }))
                                  }
                                : {
                                    ...viewModel,
                                    days: daysButOne(viewModel.tabIndex, day => ({
                                      ...day,
                                      legs: dayLegsButOne(viewModel.tabIndex as Weekday, leg => ({ ...leg, stdLowerBound }))
                                    }))
                                  }
                            )
                          }
                          disabled={viewModel.tabIndex !== 'ALL' && !viewModel.days[viewModel.tabIndex].selected}
                        />
                        <TextField
                          className={classes.flightRequirementLegInfoTextField}
                          label="STD Upper bound"
                          value={legViewModel.stdUpperBound}
                          onChange={({ target: { value: stdUpperBound } }) =>
                            setViewModel(
                              viewModel.tabIndex === 'ALL'
                                ? {
                                    ...viewModel,
                                    all: { ...viewModel.all, legs: allLegsButOne(leg => ({ ...leg, stdUpperBound })) },
                                    days: Weekdays.map(d => ({ ...viewModel.days[d], legs: dayLegsButOne(d, leg => ({ ...leg, stdUpperBound })) }))
                                  }
                                : {
                                    ...viewModel,
                                    days: daysButOne(viewModel.tabIndex, day => ({
                                      ...day,
                                      legs: dayLegsButOne(viewModel.tabIndex as Weekday, leg => ({ ...leg, stdUpperBound }))
                                    }))
                                  }
                            )
                          }
                          disabled={viewModel.tabIndex !== 'ALL' && !viewModel.days[viewModel.tabIndex].selected}
                        />
                      </Grid>
                      <Grid item xs={12} className={classes.flightRequirementLegInfoCheckBoxes}>
                        <FormControlLabel
                          className={classes.flightRequirementLegInfoCheckBox}
                          label="Origin Permission"
                          control={
                            <Checkbox
                              color="primary"
                              checked={legViewModel.originPermission}
                              onChange={(e, originPermission) =>
                                setViewModel(
                                  viewModel.tabIndex === 'ALL'
                                    ? {
                                        ...viewModel,
                                        all: { ...viewModel.all, legs: allLegsButOne(leg => ({ ...leg, originPermission })) },
                                        days: Weekdays.map(d => ({ ...viewModel.days[d], legs: dayLegsButOne(d, leg => ({ ...leg, originPermission })) }))
                                      }
                                    : {
                                        ...viewModel,
                                        days: daysButOne(viewModel.tabIndex, day => ({
                                          ...day,
                                          legs: dayLegsButOne(viewModel.tabIndex as Weekday, leg => ({ ...leg, originPermission }))
                                        }))
                                      }
                                )
                              }
                            />
                          }
                          disabled={viewModel.tabIndex !== 'ALL' && !viewModel.days[viewModel.tabIndex].selected}
                        />
                        <FormControlLabel
                          className={classes.flightRequirementLegInfoCheckBox}
                          label="Destination Permission"
                          control={
                            <Checkbox
                              color="primary"
                              checked={legViewModel.destinationPermission}
                              onChange={(e, destinationPermission) =>
                                setViewModel(
                                  viewModel.tabIndex === 'ALL'
                                    ? {
                                        ...viewModel,
                                        all: { ...viewModel.all, legs: allLegsButOne(leg => ({ ...leg, destinationPermission })) },
                                        days: Weekdays.map(d => ({ ...viewModel.days[d], legs: dayLegsButOne(d, leg => ({ ...leg, destinationPermission })) }))
                                      }
                                    : {
                                        ...viewModel,
                                        days: daysButOne(viewModel.tabIndex, day => ({
                                          ...day,
                                          legs: dayLegsButOne(viewModel.tabIndex as Weekday, leg => ({ ...leg, destinationPermission }))
                                        }))
                                      }
                                )
                              }
                            />
                          }
                          disabled={viewModel.tabIndex !== 'ALL' && !viewModel.days[viewModel.tabIndex].selected}
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
    </ModalBase>
  );

  function daysButOne(day: Weekday, dayTabFactory: DayTabViewModel | ((day: DayTabViewModel) => DayTabViewModel)): DayTabViewModel[] {
    return [...viewModel.days.slice(0, day - 1), typeof dayTabFactory === 'function' ? dayTabFactory(viewModel.days[day]) : dayTabFactory, ...viewModel.days.slice(day + 1)];
  }
  function routeButOne(routeLegFactory: RouteLegViewModel | ((routeLeg: RouteLegViewModel) => RouteLegViewModel)): RouteLegViewModel[] {
    return [
      ...viewModel.route.slice(0, viewModel.legIndex - 1),
      typeof routeLegFactory === 'function' ? routeLegFactory(viewModel.route[viewModel.legIndex]) : routeLegFactory,
      ...viewModel.route.slice(viewModel.legIndex + 1)
    ];
  }
  function allLegsButOne(legFactory: LegViewModel | ((leg: LegViewModel) => LegViewModel)): LegViewModel[] {
    return [
      ...viewModel.all.legs.slice(0, viewModel.legIndex - 1),
      typeof legFactory === 'function' ? legFactory(viewModel.all.legs[viewModel.legIndex]) : legFactory,
      ...viewModel.all.legs.slice(viewModel.legIndex + 1)
    ];
  }
  function dayLegsButOne(day: Weekday, legFactory: LegViewModel | ((leg: LegViewModel) => LegViewModel)): LegViewModel[] {
    return [
      ...viewModel.days[day].legs.slice(0, viewModel.legIndex - 1),
      typeof legFactory === 'function' ? legFactory(viewModel.days[day].legs[viewModel.legIndex]) : legFactory,
      ...viewModel.days[day].legs.slice(viewModel.legIndex + 1)
    ];
  }
};

export default FlightRequirementModal;
