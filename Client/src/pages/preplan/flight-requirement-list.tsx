import React, { FC, useState, useContext, useEffect } from 'react';
import { Theme, Paper, Tabs, Tab, IconButton, Grid, TableHead, TableRow, TableCell, Table, TableBody, Typography, Switch, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { NavBarToolsContainerContext } from 'src/pages/preplan';
import { fade } from '@material-ui/core/styles';
import Search from 'src/components/Search';
import { DoneAll as FinilizedIcon, Add as AddIcon, Edit as EditIcon, Clear as ClearIcon, Done as DoneIcon } from '@material-ui/icons';
import classNames from 'classnames';
import Weekday from '@core/types/Weekday';

import TablePagination from '@material-ui/core/TablePagination';
import TablePaginationActions from 'src/components/PaginationAction';

import FlightRequirement from 'src/view-models/flights/FlightRequirement';
import WeekdayFlightRequirement from 'src/view-models/flights/WeekdayFlightRequirement';
import AircraftIdentityType from '@core/types/aircraft-identity/AircraftIdentityType';
import Preplan from 'src/view-models/Preplan';
import MasterData from '@core/master-data';
import { FlightScopeModel } from '@core/models/flights/FlightScopeModel';
import FlightTimeModel from '@core/models/flights/FlightTimeModel';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';
import FlightRequirementModel from '@core/models/flights/FlightRequirementModel';
import { required } from 'yargs';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';
import PreplanService from 'src/services/PreplanService';

const useStyles = makeStyles((theme: Theme) => ({
  contentPage: {
    maxWidth: '1176px',
    margin: 'auto'
  },
  flightRequirmentStyle: {
    marginTop: theme.spacing(2)
  },
  flightDefinitionStyle: {
    backgroundColor: theme.palette.grey[300],
    padding: theme.spacing(2, 2),
    borderRadius: '4px 4px 0px 0px'
  },
  returnStyle: {
    color: theme.palette.primary.main
  },
  paperDisableStyle: {
    backgroundColor: fade(theme.palette.grey[300], 0.3)
  },
  disableOpacityStyle: {
    opacity: 0.5
  },
  tabsStyle: {
    borderBottom: '1px solid ',
    borderBottomColor: theme.palette.grey[300]
  },
  STDStyle: {
    '& div:not(last-child)': {
      borderBottom: '1px solid ',
      borderBottomColor: theme.palette.grey[300]
    }
  },
  STDpadding: {
    padding: theme.spacing(0)
  },
  divContent: {
    justifyContent: 'center',
    display: 'flex'
  }
}));

export interface FlightRequirementListPageProps {
  flightRequirements: ReadonlyArray<FlightRequirement>;
  preplan: Preplan;
  onAddFlightRequirement: () => void;
  onRemoveFlightRequirement: (flightRequirement: FlightRequirement) => void;
  onEditFlightRequirement: (flightRequirement: FlightRequirement) => void;
  onAddReturnFlightRequirement: (flightRequirement: FlightRequirement) => void;
  onRemoveWeekdayFlightRequirement: (weekdayFlightRequirement: WeekdayFlightRequirement, flightRequirement: FlightRequirement) => void;
  onEditWeekdayFlightRequirement: (weekdayFlightRequirement: WeekdayFlightRequirement, flightRequirement: FlightRequirement) => void;
}

type Tab = 'ALL' | 'INCLUDE' | 'IGNORE';

const FlightRequirementListPage: FC<FlightRequirementListPageProps> = React.memo(
  ({
    flightRequirements,
    preplan,
    onAddFlightRequirement,
    onRemoveFlightRequirement,
    onEditFlightRequirement,
    onAddReturnFlightRequirement,
    onRemoveWeekdayFlightRequirement,
    onEditWeekdayFlightRequirement
  }) => {
    // useEffect(() => {
    //   console.log('flightRequirements', flightRequirements);
    // }, [flightRequirements]);

    // useEffect(() => {
    //   console.log('onAddFlightRequirement', onAddFlightRequirement);
    // }, [onAddFlightRequirement]);

    // useEffect(() => {
    //   console.log('onRemoveFlightRequirement', onRemoveFlightRequirement);
    // }, [onRemoveFlightRequirement]);

    // useEffect(() => {
    //   console.log('onEditFlightRequirement', onEditFlightRequirement);
    // }, [onEditFlightRequirement]);

    // useEffect(() => {
    //   console.log('onAddReturnFlightRequirement', onAddReturnFlightRequirement);
    // }, [onAddReturnFlightRequirement]);

    // useEffect(() => {
    //   console.log('onRemoveWeekdayFlightRequirement', onRemoveWeekdayFlightRequirement);
    // }, [onRemoveWeekdayFlightRequirement]);

    // useEffect(() => {
    //   console.log('onEditWeekdayFlightRequirement', onEditWeekdayFlightRequirement);
    // }, [onEditWeekdayFlightRequirement]);

    console.log(flightRequirements);

    const navBarToolsContainer = useContext(NavBarToolsContainerContext);
    const [tab, setTab] = useState<Tab>('ALL');
    const [searchValue, setSearchValue] = useState<readonly string[]>([]);
    const [numberOfAllFR, setNumberOfAllFr] = useState(0);
    const [numberOfIgnoreFR, setNumberOfIgnoreFr] = useState(0);
    const [filterFlightRequirment, setFilterFlightRequirment] = useState<ReadonlyArray<FlightRequirement>>(flightRequirements);
    const [pageNumber, setPageNumber] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(10);

    const classes = useStyles();

    const handleChange = <T extends {}>(
      list: ReadonlyArray<T>,
      item: T,
      propertyName: keyof T,
      newValue: any,
      settter: (value: React.SetStateAction<ReadonlyArray<T>>) => void
    ) => {
      const tempList = [...list];
      const index = list.indexOf(item);
      tempList[index][propertyName] = newValue;
      settter(tempList);
      return tempList[index];
    };

    const filterOnProperties = (query: readonly string[]): ReadonlyArray<FlightRequirement> => {
      if (!query || query.length <= 0) return flightRequirements;

      return flightRequirements.filter(item => {
        for (let j = 0; j < query.length; ++j) {
          if (((item.definition.label || '') as string).toLowerCase().includes(query[j])) return true;
          if (((item.definition.arrivalAirport.name || '') as string).toLowerCase().includes(query[j])) return true;
          if (((item.definition.departureAirport.name || '') as string).toLowerCase().includes(query[j])) return true;
          if (((item.definition.flightNumber || '') as string).toLowerCase().includes(query[j])) return true;
        }
      });
    };

    const filterFlightRequiermentBySelectedTab = (filterItem: ReadonlyArray<FlightRequirement>, t: Tab) => {
      setNumberOfAllFr(filterItem.length);
      setNumberOfIgnoreFr(filterItem.filter(fr => fr.ignored === true).length);
      setPageNumber(0);

      if (t === 'ALL') return setFilterFlightRequirment(filterItem);
      if (t === 'INCLUDE') return setFilterFlightRequirment(filterItem.filter(fr => fr.ignored === false));
      if (t === 'IGNORE') return setFilterFlightRequirment(filterItem.filter(fr => fr.ignored === true));
    };

    return (
      <div className={classes.contentPage}>
        <Tabs
          className={classes.tabsStyle}
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          onChange={(event, t) => {
            setTab(t);
            filterFlightRequiermentBySelectedTab(filterOnProperties(searchValue), t);
          }}
        >
          <Tab value="ALL" label={'ALL (' + numberOfAllFR + ')'} />
          <Tab value="INCLUDE" label={'INCLUDE (' + (numberOfAllFR - numberOfIgnoreFR) + ')'} />
          <Tab value="IGNORE" label={'IGNORE (' + numberOfIgnoreFR + ')'} />
          <Search
            outlined
            onQueryChange={query => {
              setSearchValue(query);
              filterFlightRequiermentBySelectedTab(filterOnProperties(query), tab);
            }}
          />
          <IconButton color="primary" title="Add Preplan" onClick={() => onAddFlightRequirement()}>
            <AddIcon fontSize="large" />
          </IconButton>
        </Tabs>

        {filterFlightRequirment.slice(pageNumber * rowPerPage, (pageNumber + 1) * rowPerPage).map(d => {
          return (
            <Paper key={d.id} className={classNames(classes.flightRequirmentStyle, d.ignored && classes.paperDisableStyle)}>
              <Grid container direction="row" justify="space-between" alignItems="center" className={classes.flightDefinitionStyle}>
                <Grid item className={classNames(d.ignored && classes.disableOpacityStyle)}>
                  <Grid container direction="row" justify="center" alignItems="center" spacing={3}>
                    <Grid item>
                      <Typography variant="h6">{d.definition.label}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h6">{d.definition.flightNumber}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h6">
                        {d.definition.departureAirport.name}-{d.definition.arrivalAirport.name}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid container direction="row" justify="center" alignItems="center" spacing={3}>
                    <Grid item>Include</Grid>
                    <Grid item>
                      <Switch
                        checked={!d.ignored}
                        onChange={async e => {
                          //TODO remove
                          const newValue = handleChange(filterFlightRequirment, d, 'ignored', !e.target.checked, setFilterFlightRequirment);

                          const flightRequirement = newValue as FlightRequirement;

                          const newFrModel = [flightRequirement].map(fi => {
                            const fr = fi;

                            const frScope: FlightScopeModel = {
                              blockTime: fr.scope.blockTime,
                              times: fr.scope.times!.map(t => {
                                return { stdLowerBound: t.stdLowerBound.minutes, stdUpperBound: t.stdUpperBound.minutes } as FlightTimeModel;
                              }),
                              destinationPermission: !!fr.scope.destinationPermission,
                              originPermission: !!fr.scope.originPermission,
                              required: !!fr.scope.required,
                              rsx: fr.scope.rsx!,
                              aircraftSelection: {
                                allowedIdentities: fr.scope.aircraftSelection.allowedIdentities
                                  ? fr.scope.aircraftSelection.allowedIdentities.map(a => ({ entityId: a.entity.id, type: a.type } as AircraftIdentityModel))
                                  : [],
                                forbiddenIdentities: fr.scope.aircraftSelection.forbiddenIdentities
                                  ? fr.scope.aircraftSelection.forbiddenIdentities.map(a => ({ entityId: a.entity.id, type: a.type } as AircraftIdentityModel))
                                  : []
                              }
                            };

                            const model: FlightRequirementModel = {
                              id: fr.id,
                              definition: {
                                label: fr.definition.label || '',
                                category: fr.definition.category || '',
                                stcId: fr.definition.stc ? fr.definition.stc.id : '',
                                flightNumber: (fr.definition.flightNumber || '').toUpperCase(),
                                departureAirportId: fr.definition.departureAirport.id,
                                arrivalAirportId: fr.definition.arrivalAirport.id
                              },
                              scope: frScope,
                              days: fr.days.map(d => {
                                const dayScope: FlightScopeModel = {
                                  blockTime: d.scope.blockTime,
                                  times: d.scope.times!.map(t => {
                                    return { stdLowerBound: t.stdLowerBound.minutes, stdUpperBound: t.stdUpperBound.minutes } as FlightTimeModel;
                                  }),
                                  destinationPermission: !!d.scope.destinationPermission,
                                  originPermission: !!d.scope.originPermission,
                                  required: d.scope.required,
                                  rsx: d.scope.rsx!,
                                  aircraftSelection: {
                                    allowedIdentities: d.scope.aircraftSelection.allowedIdentities
                                      ? d.scope.aircraftSelection.allowedIdentities.map(a => ({ entityId: a.entity.id, type: a.type } as AircraftIdentityModel))
                                      : [],
                                    forbiddenIdentities: d.scope.aircraftSelection.forbiddenIdentities
                                      ? d.scope.aircraftSelection.forbiddenIdentities.map(a => ({ entityId: a.entity.id, type: a.type } as AircraftIdentityModel))
                                      : []
                                  }
                                };

                                return {
                                  day: d.day,
                                  notes: d.notes,
                                  scope: dayScope,
                                  freezed: d.freezed,
                                  flight: {
                                    std: d.flight.std.minutes,
                                    aircraftRegisterId: d.flight.aircraftRegister && d.flight.aircraftRegister.id
                                  }
                                } as WeekdayFlightRequirementModel;
                              }),
                              ignored: !e.target.checked
                            };
                            return model;
                          });

                          await PreplanService.editFlightRequirements(newFrModel);

                          filterFlightRequiermentBySelectedTab(filterOnProperties(searchValue), tab);
                        }}
                        color="primary"
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                      />
                    </Grid>
                    <Grid item className={d.ignored ? classes.disableOpacityStyle : ''}>
                      <Button
                        color="primary"
                        onClick={() => {
                          onAddReturnFlightRequirement(d);
                        }}
                      >
                        RETURN
                      </Button>
                    </Grid>
                    <Grid item className={classNames(d.ignored && classes.disableOpacityStyle)}>
                      <IconButton size="small" disabled={d.ignored} onClick={() => onEditFlightRequirement(d)}>
                        <EditIcon fontSize="large" />
                      </IconButton>
                    </Grid>
                    <Grid item className={classNames(d.ignored && classes.disableOpacityStyle)}>
                      <IconButton
                        size="small"
                        disabled={d.ignored}
                        onClick={() => {
                          onRemoveFlightRequirement(d);
                        }}
                      >
                        <ClearIcon fontSize="large" />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container className={classNames(d.ignored && classes.disableOpacityStyle)}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>WeekDay</TableCell>
                      <TableCell>BlockTime</TableCell>
                      <TableCell>Allowed Registers</TableCell>
                      <TableCell>Forbidden Registers</TableCell>
                      <TableCell align="center">STD Lower Bound</TableCell>
                      <TableCell align="center">STD Upper Bound</TableCell>
                      <TableCell>Requierd</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {d.days.map(item => {
                      console.log(item);
                      return (
                        <TableRow key={item.derivedId} hover={true}>
                          <TableCell>{Weekday[item.day]}</TableCell>
                          <TableCell>{item.scope.blockTime}</TableCell>
                          <TableCell>{item.scope.aircraftSelection.allowedIdentities.map(a => a.entity.name).join(', ')}</TableCell>
                          <TableCell>{item.scope.aircraftSelection.forbiddenIdentities.map(a => a.entity.name).join(', ')}</TableCell>
                          <TableCell align="center" className={classes.STDpadding}>
                            {item.scope.times.map(t => {
                              return (
                                <div className={classNames(classes.STDStyle, classes.STDpadding)} key={'timescopeLowerBound' + Math.random() + d.id}>
                                  <div>{t.stdLowerBound.toString()}</div>
                                </div>
                              );
                            })}
                          </TableCell>
                          <TableCell align="center" className={classes.STDpadding}>
                            {item.scope.times.map(t => {
                              return (
                                <div className={classNames(classes.STDStyle, classes.STDpadding)} key={'timescopeUpperBound' + Math.random() + d.id}>
                                  <div>{t.stdUpperBound.toString()}</div>
                                </div>
                              );
                            })}
                          </TableCell>
                          <TableCell>{item.scope.required && <DoneIcon />}</TableCell>
                          <TableCell>
                            <IconButton
                              disabled={d.ignored}
                              onClick={() => {
                                onEditWeekdayFlightRequirement(item, d);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              disabled={d.ignored}
                              onClick={() => {
                                onRemoveWeekdayFlightRequirement(item, d);
                              }}
                            >
                              <ClearIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Grid>
            </Paper>
          );
        })}
        <div />
        <TablePagination
          classes={{ root: classes.divContent }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          count={filterFlightRequirment.length}
          onChangePage={(e, n) => {
            setPageNumber(n);
          }}
          page={pageNumber}
          rowsPerPage={rowPerPage}
          onChangeRowsPerPage={e => {
            setRowPerPage(+e.target.value);
            setPageNumber(0);
          }}
          ActionsComponent={TablePaginationActions}
        />
      </div>
    );
  }
);

export default FlightRequirementListPage;
