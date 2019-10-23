import React, { FC, Fragment, useState, useEffect, useRef, createContext, useCallback, useMemo, RefObject } from 'react';
import { Theme, TextField, Fab, Grid, Typography, IconButton, FormControlLabel, Checkbox, Tabs, Tab, Button, Icon, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import useRouter from 'src/utils/useRouter';
import NavBar from 'src/components/NavBar';
import ResourceSchedulerPage from 'src/pages/preplan/resource-scheduler';
import FlightRequirementListPage from 'src/pages/preplan/flight-requirement-list';
import ReportsPage from 'src/pages/preplan/reports';
import Preplan from 'src/business/Preplan';
import PreplanAircraftIdentity from 'src/business/PreplanAircraftIdentity';
import MasterData, { Stc, Stcs, MasterDataItem } from '@core/master-data';
import FlightRequirement from 'src/business/flights/FlightRequirement';
import PreplanService from 'src/services/PreplanService';
import FlightRequirementModel from '@core/models/flights/FlightRequirementModel';
import FlightTimeModel from '@core/models/flights/FlightTimeModel';
import { parseAirport, parseHHMM, parseMinute } from 'src/utils/model-parsers';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';
import FlightScopeModel from '@core/models/flights/FlightScopeModel';
import SimpleModal from 'src/components/SimpleModal';
import AutoComplete from 'src/components/AutoComplete';
import DaysPicker from 'src/components/DaysPicker';
import { Clear as ClearIcon, Add as AddIcon, WrapText as WrapTextIcon, ArrowRightAlt as ArrowRightAltIcon } from '@material-ui/icons';
import Rsx, { Rsxes } from '@core/types/flight-requirement/Rsx';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';
import MultiSelect from 'src/components/MultiSelect';
import PreplanAircraftSelection from 'src/business/PreplanAircraftSelection';
import WeekdayFlightRequirement from 'src/business/flights/WeekdayFlightRequirement';
import PreplanAircraftRegister from 'src/business/PreplanAircraftRegister';
import { FlightRequirementModalModel, FlightRequirementModalAircraftIdentity, FlightRequirementModalMode } from 'src/components/preplan/flight-requirement/FlightRequirementEditor';
import FlightModel from '@core/models/flights/FlightModel';
import StarRateIcon from '@material-ui/icons/StarRate';
import { borders } from '@material-ui/system';
import Paper from '@material-ui/core/Paper';

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
  },
  dayTab: {
    minWidth: 70,
    maxWidth: 70
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
  },
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
  }
  // ,
  // flightRequirementLegItems: {
  //   '& span': {

  //   }
  // }
}));

export interface ObjectionModalModel {
  open: boolean;
  newErrorObjectsCount?: number;
}

interface FlightRequirementWithMultiLegModalModel {
  open: boolean;
  loading: boolean;
  errorMessage?: string;
  mode?: FlightRequirementModalMode;
  label?: string;
  disable?: boolean;
  category?: string;
  stc?: Stc;
  days: boolean[];

  //details?: { [index: number]: FlightRequirmentDetailModalModel };
  details: FlightRequirmentDetailModalModel[];
}

interface FlightRequirmentDetailModalModel {
  rsx?: Rsx;
  allowedAircraftIdentities?: FlightRequirementModalAircraftIdentity[];
  forbiddenAircraftIdentities?: FlightRequirementModalAircraftIdentity[];
  notes?: string;
  legs: Leg[];
}

interface Leg {
  flightNumber?: string;
  departure?: string;
  arrival?: string;
  blockTime?: string;
  stdLowerbound?: string;
  stdUpperbound?: string;
  originPermission?: boolean;
  destinationpermission?: boolean;
}

export const NavBarToolsContainerContext = createContext<HTMLDivElement | null>(null);

const rsxOptions = Rsxes.map(r => ({ name: r }));

const PreplanPage: FC = () => {
  const [preplan, setPreplan] = useState<Preplan | null>(null);
  const [objectionModalModel, setObjectionModalModel] = useState<ObjectionModalModel>({ open: false });
  const [flightRequirementWithMultiLegModalModel, setFlightRequirementWithMultiLegModalModel] = useState<FlightRequirementWithMultiLegModalModel>(() => {
    const result: FlightRequirementWithMultiLegModalModel = { open: false, loading: false, details: [], days: [], stc: MasterData.all.stcs.items.find(n => n.name === 'J') };
    Array.range(0, 6).forEach(i => result.days!.push(false));
    return result;
  });
  const navBarToolsRef = useRef<HTMLDivElement>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [legIndex, setLegIndex] = useState(0);

  const { match } = useRouter<{ id: string }>();
  const classes = useStyles();
  const weekDaysArray: string[] = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

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
  const aircraftRegisterGroupIdentities = useMemo<FlightRequirementModalAircraftIdentity[]>(
    () =>
      MasterData.all.aircraftRegisterGroups.items.map((g, index) => ({
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
  const aircraftIdentities = useMemo<FlightRequirementModalAircraftIdentity[]>(
    () => aircraftRegisterIdentities.concat(aircraftRegisterGroupIdentities).concat(aircraftTypeIdentities),
    [aircraftRegisterIdentities, aircraftRegisterGroupIdentities, aircraftTypeIdentities]
  );

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

  // useEffect(() => {
  //   console.log(flightRequirementWithMultiLegModalModel, flightRequirementWithMultiLegModalModel.details);
  // }, [flightRequirementWithMultiLegModalModel, flightRequirementWithMultiLegModalModel.details]);

  // useEffect(() => {
  //   console.table('flightRequirementWithMultiLegModalModel', flightRequirementWithMultiLegModalModel);
  // }, [flightRequirementWithMultiLegModalModel]);

  const resourceSchedulerPageSelected = window.location.href.startsWith(`${window.location.origin}/#${match.url}/resource-scheduler`);
  const flightRequirementListPageSelected = window.location.href.startsWith(`${window.location.origin}/#${match.url}/flight-requirement-list`);
  const reportsPageSelected = window.location.href.startsWith(`${window.location.origin}/#${match.url}/reports`);
  const reportsProposalPageSelected = reportsPageSelected && window.location.hash.endsWith('/proposal');
  const reportsConnectionsPageSelected = reportsPageSelected && window.location.hash.endsWith('/connections');
  flightRequirementWithMultiLegModalModel.details = flightRequirementWithMultiLegModalModel.details || [];

  if (flightRequirementWithMultiLegModalModel.details.length === 0) {
    for (let index = 0; index < 8; index++) {
      flightRequirementWithMultiLegModalModel.details.push({ legs: [{}], rsx: {} } as FlightRequirmentDetailModalModel);
    }
    flightRequirementWithMultiLegModalModel.details[0].rsx = Rsxes[0];
  }

  return (
    <Fragment>
      <NavBar
        backLink={resourceSchedulerPageSelected ? '/preplan-list' : reportsProposalPageSelected || reportsConnectionsPageSelected ? `${match.url}/reports` : match.url}
        backTitle={
          resourceSchedulerPageSelected
            ? 'Back to Pre Plan List'
            : reportsProposalPageSelected || reportsConnectionsPageSelected
            ? `Back to Pre Plan ${preplan && preplan.name} Reports`
            : `Back to Pre Plan ${preplan && preplan.name}`
        }
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
          reportsProposalPageSelected && {
            title: 'Proposal Report',
            link: `${match.url}/reports/proposal`
          },
          reportsConnectionsPageSelected && {
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

      {/* <SimpleModal
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
                preplan!.stage({ removingFlightRequirementId: flightRequirementModalModel.flightRequirement!.id });
                preplan!.commit();
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

                preplan!.stage({ mergingFlightRequirementModels: [model] });
                preplan!.commit();
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
      </SimpleModal> */}

      <SimpleModal
        key="objectionModal"
        title="Are you sure to perform this action?"
        open={objectionModalModel.open}
        actions={[{ title: 'Cancel' }, { title: 'Continue' }]}
        onClose={() => setObjectionModalModel({ ...objectionModalModel, open: false })}
      >
        <Typography>
          This action causes
          <Typography variant="h6" display="inline" color="primary">
            &nbsp;&nbsp;{objectionModalModel.newErrorObjectsCount}&nbsp;&nbsp;
          </Typography>
          new error objections to be issued.
        </Typography>
      </SimpleModal>

      <SimpleModal
        maxWidth={false}
        PaperProps={{ className: classes.flightRequirementStyle }}
        key="flightRequirementEditorWithMultiLeg"
        open={flightRequirementWithMultiLegModalModel.open && (flightRequirementWithMultiLegModalModel.mode === 'ADD' || flightRequirementWithMultiLegModalModel.mode === 'EDIT')}
        loading={flightRequirementWithMultiLegModalModel.loading}
        errorMessage={flightRequirementWithMultiLegModalModel.errorMessage}
        cancelable={true}
        title={
          flightRequirementWithMultiLegModalModel.mode === 'ADD'
            ? 'What is the new flight requirement?'
            : flightRequirementWithMultiLegModalModel.mode === 'EDIT'
            ? 'Edit flight requirement'
            : flightRequirementWithMultiLegModalModel.mode === 'READ_ONLY'
            ? 'Flight requirement'
            : ''
        }
        actions={[
          {
            title: 'Cancel'
          },
          {
            title: 'Submit',
            action: () => {
              console.log(flightRequirementWithMultiLegModalModel);
              // setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel, loading: true });

              // if (true) {
              //   setFlightRequirementWithMultiLegModalModel(flightRequirementWithMultiLegModalModel => ({
              //     ...flightRequirementWithMultiLegModalModel,
              //     open: false,
              //     loading: false
              //   }));
              // } else {
              //   setFlightRequirementWithMultiLegModalModel(flightRequirementWithMultiLegModalModel => ({
              //     ...flightRequirementWithMultiLegModalModel,
              //     errorMessage: 'error accourd',
              //     loading: false
              //   }));
              // }
            }
          }
        ]}
        onClose={() => {
          setSelectedDay(0);
          setLegIndex(0);
          setFlightRequirementWithMultiLegModalModel(flightRequirementWithMultiLegModalModel => ({ ...flightRequirementWithMultiLegModalModel, open: false }));
        }}
      >
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="caption" className={classes.flightRequirementInformationTitle}>
              Flight Information
            </Typography>
          </Grid>
          <Grid item xs={5} className={classes.flightRequirementInformationTextField}>
            <TextField
              fullWidth
              label="Label"
              value={flightRequirementWithMultiLegModalModel.label || ''}
              onChange={l => setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel, label: l.target.value })}
              disabled={flightRequirementWithMultiLegModalModel.disable}
            />
          </Grid>
          <Grid item xs={5} className={classes.flightRequirementInformationTextField}>
            <TextField
              fullWidth
              label="Category"
              value={flightRequirementWithMultiLegModalModel.category || ''}
              onChange={l => setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel, category: l.target.value })}
              disabled={flightRequirementWithMultiLegModalModel.disable}
            />
          </Grid>
          <Grid item xs={2} className={classes.flightRequirementInformationTextField}>
            <AutoComplete
              options={MasterData.all.stcs.items}
              label="Stc"
              getOptionLabel={l => l.name}
              getOptionValue={l => l.id}
              value={flightRequirementWithMultiLegModalModel.stc || MasterData.all.stcs.items[9]}
              onSelect={s => {
                setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel, stc: s });
              }}
              isDisabled={flightRequirementWithMultiLegModalModel.disable}
            />
          </Grid>

          <Grid item xs={12}>
            <Paper className={classes.flightRequirementInformationContainerPaper}>
              <Tabs
                className={classes.flightRequirementWeekDaysTab}
                key="weekday"
                value={selectedDay}
                onChange={(event, t) => {
                  setSelectedDay(t);
                }}
              >
                <Tab
                  key={'All'}
                  className={classes.dayTab}
                  label={'All'}
                  // component={React.forwardRef<HTMLDivElement>((props, ref) => {
                  //   return (
                  //     <div {...props} ref={ref}>
                  //       <Checkbox indeterminate color="primary" />
                  //       All
                  //     </div>
                  //   );
                  // })}
                />
                {weekDaysArray.map((weekDay, tabIndex) => (
                  <Tab
                    key={weekDay}
                    className={classes.dayTab}
                    label={weekDay}
                    // component={React.forwardRef<HTMLDivElement>((props, ref) => {
                    //   return (
                    //     <div {...props} ref={ref}>
                    //       <Checkbox />
                    //       {weekDay}
                    //     </div>
                    //   );
                    // })}
                  />
                ))}
              </Tabs>
              <Grid item xs={12} className={classes.flightRequirementInformationContainer}>
                {/* <FlightRequirementDetail></FlightRequirementDetail> */}
                <Grid container>
                  <Grid item xs={2} className={classes.flightRequirementDaysTextField}>
                    <AutoComplete
                      label="RSX"
                      options={rsxOptions}
                      getOptionLabel={l => l.name}
                      getOptionValue={v => v.name}
                      value={{ name: flightRequirementWithMultiLegModalModel.details[selectedDay].rsx! || Rsxes[0] }}
                      onSelect={s => {
                        for (let index = 0; index < flightRequirementWithMultiLegModalModel.days.length; index++) {
                          if (flightRequirementWithMultiLegModalModel.days[index] && selectedDay === 0) {
                            flightRequirementWithMultiLegModalModel.details[index + 1].rsx = s.name;
                          }
                        }

                        flightRequirementWithMultiLegModalModel.details[selectedDay].rsx = s.name;
                        setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                      }}
                      disabled={flightRequirementWithMultiLegModalModel.disable}
                    />
                  </Grid>
                  <Grid item xs={8} className={classes.flightRequirementDaysTextField}>
                    <TextField
                      fullWidth
                      label="Notes"
                      value={flightRequirementWithMultiLegModalModel.details[selectedDay].notes || ''}
                      onChange={s => {
                        //////
                        // if (selectedDay === 0) {
                        //   flightRequirementWithMultiLegModalModel.details.map((day, index) => {
                        //     if (!day.isModified && index > 0) {
                        //       flightRequirementWithMultiLegModalModel.details[index].notes = s.target.value;
                        //     }
                        //   });
                        // }
                        //////

                        for (let index = 0; index < flightRequirementWithMultiLegModalModel.days.length; index++) {
                          if (flightRequirementWithMultiLegModalModel.days[index] && selectedDay === 0) {
                            flightRequirementWithMultiLegModalModel.details[index + 1].notes = s.target.value;
                          }
                        }

                        flightRequirementWithMultiLegModalModel.details[selectedDay].notes = s.target.value;
                        setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                      }}
                    />
                  </Grid>
                  <Grid item xs={2} className={classes.flightRequirementInformationButton}>
                    {!selectedDay ? null : (
                      <Button
                        onClick={() => {
                          const mainTabInfo = { ...flightRequirementWithMultiLegModalModel.details[0] };
                          flightRequirementWithMultiLegModalModel.details[selectedDay].legs = [...mainTabInfo.legs];
                          flightRequirementWithMultiLegModalModel.details[selectedDay].rsx = { ...mainTabInfo }.rsx;

                          flightRequirementWithMultiLegModalModel.details[selectedDay].allowedAircraftIdentities = [...(mainTabInfo.allowedAircraftIdentities || [])];
                          flightRequirementWithMultiLegModalModel.details[selectedDay].forbiddenAircraftIdentities = [...(mainTabInfo.forbiddenAircraftIdentities || [])];
                          flightRequirementWithMultiLegModalModel.details[selectedDay].notes = { ...mainTabInfo }.notes;

                          setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                        }}
                        color="primary"
                      >
                        {'Default'}
                      </Button>
                    )}
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
                      options={aircraftIdentities}
                      getOptionLabel={l => l.name}
                      getOptionValue={l => l.id}
                      value={flightRequirementWithMultiLegModalModel.details[selectedDay].allowedAircraftIdentities || []}
                      isDisabled={flightRequirementWithMultiLegModalModel.disable}
                      onSelect={l => {
                        for (let index = 0; index < flightRequirementWithMultiLegModalModel.days.length; index++) {
                          if (flightRequirementWithMultiLegModalModel.days[index] && selectedDay === 0) {
                            flightRequirementWithMultiLegModalModel.details[index + 1].allowedAircraftIdentities = l ? [...l] : [];
                          }
                        }
                        flightRequirementWithMultiLegModalModel.details[selectedDay].allowedAircraftIdentities = l ? [...l] : [];
                        setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                      }}
                    ></MultiSelect>
                  </Grid>
                  <Grid item xs={6} className={classes.flightRequirementDaysTextField}>
                    <MultiSelect
                      options={aircraftIdentities}
                      getOptionLabel={l => l.name}
                      getOptionValue={l => l.id}
                      value={flightRequirementWithMultiLegModalModel.details[selectedDay].forbiddenAircraftIdentities || []}
                      isDisabled={flightRequirementWithMultiLegModalModel.disable}
                      onSelect={l => {
                        // if (selectedDay === 0) {
                        //   flightRequirementWithMultiLegModalModel.details.map((day, index) => {
                        //     if (!day.isModified && index > 0) {
                        //       flightRequirementWithMultiLegModalModel.details[index].forbiddenAircraftIdentities = l ? [...l] : [];
                        //     }
                        //   });
                        // }
                        for (let index = 0; index < flightRequirementWithMultiLegModalModel.days.length; index++) {
                          if (flightRequirementWithMultiLegModalModel.days[index] && selectedDay === 0) {
                            flightRequirementWithMultiLegModalModel.details[index + 1].forbiddenAircraftIdentities = l ? [...l] : [];
                          }
                        }
                        flightRequirementWithMultiLegModalModel.details[selectedDay].forbiddenAircraftIdentities = l ? [...l] : [];
                        setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                      }}
                    ></MultiSelect>
                  </Grid>

                  <Paper className={classes.flightRequirementLegContainerPaper}>
                    <Grid item xs={12} className={classes.flightRequirementLegContainer}>
                      <Grid container className={classes.flightRequirementLegTabs}>
                        <Grid item xs={11}>
                          <Tabs key="legs" value={legIndex} onChange={(event, newValue) => setLegIndex(newValue)} variant="scrollable" scrollButtons="auto">
                            {flightRequirementWithMultiLegModalModel.details[selectedDay].legs.map((l, index, source) => (
                              <Tab
                                key={index}
                                component={React.forwardRef<HTMLDivElement>((props, ref) => {
                                  return (
                                    <div {...props} ref={ref} className={classes.legsTab}>
                                      <div className={classes.legTab}>
                                        {!!flightRequirementWithMultiLegModalModel.details[selectedDay].legs[index].flightNumber ? (
                                          <Typography className={classes.legTabFlightNumber} variant="caption">
                                            {flightRequirementWithMultiLegModalModel.details[selectedDay].legs[index].flightNumber}
                                          </Typography>
                                        ) : (
                                          <Typography className={classes.legTabFlightNumber}>{'W5 XXXX'}</Typography>
                                        )}
                                        {/* <TextField floatingLabelText="Fixed Floating Label Text" floatingLabelFixed={true} /> */}
                                        <Button className={classes.legTabButton}>
                                          <Typography variant="caption">{!index ? l.departure || 'Dep' : ''}</Typography>
                                          <Typography variant="caption">
                                            <ArrowRightAltIcon className={classes.legTabRightArrow} />
                                          </Typography>
                                          <Typography variant="caption">{l.arrival || 'Arr'}</Typography>
                                        </Button>
                                      </div>
                                      {index > 0 && (
                                        <IconButton
                                          className={classes.clearButton}
                                          onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                            event.stopPropagation();
                                            const legs = flightRequirementWithMultiLegModalModel.details[selectedDay].legs;
                                            const leg = legs[index];
                                            flightRequirementWithMultiLegModalModel.details[selectedDay].legs.remove(leg);
                                            // legs.splice(index, 1);
                                            if (index <= legIndex) setLegIndex(legIndex - 1);

                                            setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                                          }}
                                        >
                                          <ClearIcon className={classes.clearIcon} />
                                        </IconButton>
                                      )}
                                    </div>
                                  );
                                })}
                              />
                            ))}
                            <Tab
                              className={classes.addButton}
                              component={React.forwardRef<HTMLButtonElement>((props, ref) => (
                                <IconButton
                                  {...props}
                                  ref={ref}
                                  onClick={() => {
                                    const legs = flightRequirementWithMultiLegModalModel.details[selectedDay].legs;
                                    const lastLeg = legs[legs.length - 1];
                                    const lastLegStdUpperBoundInMinute = parseHHMM(lastLeg.stdUpperbound!);
                                    const lastLegStdLowerBoundInMinute = parseHHMM(lastLeg.stdLowerbound!);
                                    const lastLegBlockTimeInMinute = parseHHMM(lastLeg.blockTime);
                                    const newLegStdUpperBoundInMinute =
                                      isNaN(lastLegStdUpperBoundInMinute) || isNaN(lastLegBlockTimeInMinute)
                                        ? ''
                                        : parseMinute(lastLegStdUpperBoundInMinute + 120 + lastLegBlockTimeInMinute);
                                    const newLegStdLowerBoundInMinute =
                                      isNaN(lastLegStdLowerBoundInMinute) || isNaN(lastLegBlockTimeInMinute)
                                        ? ''
                                        : parseMinute(lastLegStdLowerBoundInMinute + 120 + lastLegBlockTimeInMinute);
                                    const leg: Leg = {
                                      departure: lastLeg.arrival,
                                      stdUpperbound: newLegStdUpperBoundInMinute,
                                      stdLowerbound: newLegStdLowerBoundInMinute
                                    };
                                    flightRequirementWithMultiLegModalModel.details[selectedDay].legs.push(leg);
                                    setLegIndex(legs.length - 1);
                                    setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                                  }}
                                >
                                  <AddIcon className={classes.addIcon} />
                                </IconButton>
                              ))}
                            ></Tab>
                          </Tabs>
                        </Grid>
                        <Grid item xs={1}>
                          <IconButton
                            onClick={() => {
                              const legs = flightRequirementWithMultiLegModalModel.details[selectedDay].legs;
                              const legsReversed = [...legs].reverse();
                              legsReversed.map((leg, index) => {
                                const legStdUpperBoundInMinute = parseHHMM(leg.stdUpperbound!);
                                const legStdLowerBoundInMinute = parseHHMM(leg.stdLowerbound!);
                                const legBlockTimeInMinute = parseHHMM(leg.blockTime);
                                const returnLegStdUpperBoundInMinute =
                                  isNaN(legStdUpperBoundInMinute) || isNaN(legBlockTimeInMinute) ? '' : parseMinute(legStdUpperBoundInMinute + 120 + legBlockTimeInMinute);
                                const returnLegStdLowerBoundInMinute =
                                  isNaN(legStdLowerBoundInMinute) || isNaN(legBlockTimeInMinute) ? '' : parseMinute(legStdLowerBoundInMinute + 120 + legBlockTimeInMinute);

                                flightRequirementWithMultiLegModalModel.details[selectedDay].legs.push({
                                  departure: leg.arrival,
                                  arrival: leg.departure,
                                  blockTime: '',
                                  stdUpperbound: returnLegStdUpperBoundInMinute,
                                  stdLowerbound: returnLegStdLowerBoundInMinute
                                });
                              });
                              setLegIndex(legs.length / 2);
                              setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                            }}
                          >
                            <WrapTextIcon />
                          </IconButton>
                        </Grid>
                      </Grid>

                      <Grid container className={classes.flightRequirementLegInfoContainer}>
                        <Grid item xs={12} className={classes.flightRequirementLegInfoTexFields}>
                          <TextField
                            className={classes.flightRequirementLegInfoTextField}
                            label="Flight Number"
                            value={
                              (flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex] &&
                                flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].flightNumber) ||
                              ''
                            }
                            onChange={l => {
                              flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].flightNumber = l.target.value;
                              setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                            }}
                            disabled={!!selectedDay || flightRequirementWithMultiLegModalModel.disable}
                          />
                          <TextField
                            className={classes.flightRequirementLegInfoTextField}
                            label="Departure"
                            value={
                              (flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex] &&
                                flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].departure) ||
                              ''
                            }
                            onChange={l => {
                              flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].departure = l.target.value;
                              setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                            }}
                            disabled={!!selectedDay || flightRequirementWithMultiLegModalModel.disable}
                          />
                          <TextField
                            className={classes.flightRequirementLegInfoTextField}
                            label="Arrival"
                            value={
                              (flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex] &&
                                flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].arrival) ||
                              ''
                            }
                            onChange={l => {
                              flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].arrival = l.target.value;
                              setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                            }}
                            disabled={!!selectedDay || flightRequirementWithMultiLegModalModel.disable}
                          />
                        </Grid>
                        <Grid item xs={12} className={classes.flightRequirementLegInfoTexFields}>
                          <TextField
                            className={classes.flightRequirementLegInfoTextField}
                            label="BlockTime"
                            value={
                              (flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex] &&
                                flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].blockTime) ||
                              ''
                            }
                            onChange={l => {
                              flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].blockTime = l.target.value;
                              setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                            }}
                            disabled={flightRequirementWithMultiLegModalModel.disable}
                          />
                          <TextField
                            className={classes.flightRequirementLegInfoTextField}
                            label="STDLowerbound"
                            value={
                              (flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex] &&
                                flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].stdLowerbound) ||
                              ''
                            }
                            onChange={l => {
                              flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].stdLowerbound = l.target.value;
                              setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                            }}
                            disabled={flightRequirementWithMultiLegModalModel.disable}
                          />
                          <TextField
                            className={classes.flightRequirementLegInfoTextField}
                            label="STDUpperbound"
                            value={
                              (flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex] &&
                                flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].stdUpperbound) ||
                              ''
                            }
                            onChange={l => {
                              flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].stdUpperbound = l.target.value;
                              setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                            }}
                            disabled={flightRequirementWithMultiLegModalModel.disable}
                          />
                        </Grid>
                        <Grid item xs={12} className={classes.flightRequirementLegInfoCheckBoxes}>
                          <FormControlLabel
                            className={classes.flightRequirementLegInfoCheckBox}
                            label="Destination Permission"
                            control={
                              <Checkbox
                                color="primary"
                                checked={
                                  (flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex] &&
                                    flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].destinationpermission) ||
                                  false
                                }
                                onChange={e => {
                                  flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].destinationpermission = e.target.checked;
                                  setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                                }}
                              />
                            }
                          />
                          <FormControlLabel
                            className={classes.flightRequirementLegInfoCheckBox}
                            label="Origin Permission"
                            control={
                              <Checkbox
                                color="primary"
                                checked={
                                  (flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex] &&
                                    flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].originPermission) ||
                                  false
                                }
                                onChange={e => {
                                  flightRequirementWithMultiLegModalModel.details[selectedDay].legs[legIndex].originPermission = e.target.checked;
                                  setFlightRequirementWithMultiLegModalModel({ ...flightRequirementWithMultiLegModalModel });
                                }}
                              />
                            }
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
      </SimpleModal>
    </Fragment>
  );

  function applyFlightRequirementModalModel(mode: FlightRequirementModalMode, flightRequirement?: FlightRequirement, weekdayFlightRequirement?: WeekdayFlightRequirement): void {
    const model: FlightRequirementModalModel = {
      open: false,
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

      const minimumGroundTime = flightRequirement.scope.aircraftSelection.getMinimumGroundTime(
        true,
        flightRequirement.definition.arrivalAirport.international || flightRequirement.definition.departureAirport.international,
        preplan!.startDate,
        preplan!.endDate
      );

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
        stdLowerBound: parseMinute(t.stdLowerBound.minutes + (mode === 'RETURN' ? minimumGroundTime + flightRequirement.scope.blockTime : 0)),
        stdUpperBound: parseMinute(t.stdUpperBound.minutes + (mode === 'RETURN' ? minimumGroundTime + flightRequirement.scope.blockTime : 0))
      }));
      model.day = weekdayFlightRequirement && weekdayFlightRequirement.day;
      //modalModel.unavailableDays =
    }

    function convertPreplanAircraftIdentityToAircraftIdentity(preplanAircraftIdentities: readonly PreplanAircraftIdentity[]): FlightRequirementModalAircraftIdentity[] {
      return preplanAircraftIdentities.map(n => aircraftIdentities.find(a => a.entityId === n.entity.id && a.type === n.type)!);
    }

    const newModel: FlightRequirementWithMultiLegModalModel = {
      open: true,
      loading: false,
      mode: mode,
      details: [],
      days: Array.range(0, 6).map(i => false),
      stc: MasterData.all.stcs.items.find(n => n.name === 'J')
    };

    setFlightRequirementWithMultiLegModalModel(newModel);
  }
};

export default PreplanPage;
