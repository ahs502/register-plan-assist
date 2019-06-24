import React, { FC, Fragment, useState, useContext } from 'react';
import { Theme, Portal, Paper, Tabs, Tab, IconButton, Grid, TableHead, TableRow, TableCell, Table, TableBody, Typography, Switch, Backdrop, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { NavBarToolsContainerContext } from '../preplan';
import { Weekday } from '../../business/Weekday';
import { FlightRequirementModel, FlightTime } from '../../business/FlightRequirement';
import { Daytime } from '../../business/Daytime';
import Search from '../../components/Search';
import { DoneAll as FinilizedIcon, Add as AddIcon, Edit as EditIcon, Clear as ClearIcon, Done as DoneIcon } from '@material-ui/icons';
import FlightRequirement, { WeekdayFlightRequirement, FlightScope, FlightDefinition } from '../../view-models/FlightRequirement';
import classNames from 'classnames';
import { fade } from '@material-ui/core/styles/colorManipulator';

// import { Search } from '@material-ui/icons';
// import Search from '../components/Search';

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
  }
}));

export interface FlightRequirementListPageProps {
  flightRequirements: ReadonlyArray<FlightRequirement>;
  onAddFlightRequirement: () => void;
  onRemoveFlightRequirement: (flightRequirement: FlightRequirement) => void;
  onEditFlightRequirement: (flightRequirement: FlightRequirement) => void;
  onAddReturnFlightRequirement: (flightRequirement: FlightRequirement) => void;
  onRemoveWeekdayFlightRequirement: (weekdayFlightRequirement: WeekdayFlightRequirement) => void;
  onEditWeekdayFlightRequirement: (weekdayFlightRequirement: WeekdayFlightRequirement) => void;
}

type Tab = 'ALL' | 'INCLUDE' | 'IGNORE';

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeys<T> = { [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P> }[keyof T];

type ReadonlyKeys<T> = { [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, never, P> }[keyof T];

const FlightRequirementListPage: FC<FlightRequirementListPageProps> = ({
  flightRequirements,
  onAddFlightRequirement,
  onRemoveFlightRequirement,
  onEditFlightRequirement,
  onAddReturnFlightRequirement,
  onRemoveWeekdayFlightRequirement,
  onEditWeekdayFlightRequirement
}) => {
  const navBarToolsContainer = useContext(NavBarToolsContainerContext);
  const [tab, setTab] = useState<Tab>('ALL');
  const [searchValue, setSearchValue] = useState<readonly string[]>([]);
  const [numberOfAllFR, setNumberOfAllFr] = useState(0);
  const [numberOfIgnoreFR, setNumberOfIgnoreFr] = useState(0);
  const [filterFlightRequirment, setFilterFlightRequirment] = useState<ReadonlyArray<FlightRequirement>>(dummyDatas);
  const classes = useStyles();

  const handleChange = <T extends {}>(list: ReadonlyArray<T>, item: T, propertyName: keyof T, newValue: any, settter: (value: React.SetStateAction<ReadonlyArray<T>>) => void) => {
    const tempList = [...list];
    const index = list.indexOf(item);
    tempList[index][propertyName] = newValue;
    settter(tempList);
  };

  const filterOnProperties = (query: readonly string[]): ReadonlyArray<FlightRequirement> => {
    console.log(query);
    if (!query || query.length <= 0) return dummyDatas;

    return dummyDatas.filter(item => {
      for (let j = 0; j < query.length; ++j) {
        if (((item.definition.label || '') as string).toLowerCase().includes(query[j])) return true;
        if (((item.definition.arrivalAirportId || '') as string).toLowerCase().includes(query[j])) return true;
        if (((item.definition.departureAirportId || '') as string).toLowerCase().includes(query[j])) return true;
        if (((item.definition.flightNumber || '') as string).toLowerCase().includes(query[j])) return true;
      }
    });
  };

  const filterFlightRequiermentBySelectedTab = (filterItem: ReadonlyArray<FlightRequirement>, t: Tab) => {
    setNumberOfAllFr(filterItem.length);
    setNumberOfIgnoreFr(filterItem.filter(fr => fr.ignored === true).length);

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

      {filterFlightRequirment.map(d => {
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
                    <Typography variant="h6">IKA-DXB</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container direction="row" justify="center" alignItems="center" spacing={3}>
                  <Grid item>Include</Grid>
                  <Grid item>
                    <Switch
                      checked={!d.ignored}
                      onChange={e => {
                        handleChange(filterFlightRequirment, d, 'ignored', !e.target.checked, setFilterFlightRequirment);
                        filterFlightRequiermentBySelectedTab(filterOnProperties(searchValue), tab);
                      }}
                      color="primary"
                      inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                  </Grid>
                  <Grid item className={d.ignored ? classes.disableOpacityStyle : ''}>
                    <Button color="primary">RETURN</Button>
                  </Grid>
                  <Grid item className={classNames(d.ignored && classes.disableOpacityStyle)}>
                    <IconButton size="small" disabled={d.ignored} onClick={() => onEditFlightRequirement(d)}>
                      <EditIcon fontSize="large" />
                    </IconButton>
                  </Grid>
                  <Grid item className={classNames(d.ignored && classes.disableOpacityStyle)}>
                    <IconButton size="small" disabled={d.ignored}>
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
                    return (
                      <TableRow key={'days' + Math.random() + d.id}>
                        <TableCell>{Weekday[item.day]}</TableCell>
                        <TableCell>{item.scope.blockTime}</TableCell>
                        <TableCell>'GPS, MMO'</TableCell>
                        <TableCell>"MMH"</TableCell>
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
                          <IconButton disabled={d.ignored}>
                            <EditIcon />
                          </IconButton>
                          <IconButton disabled={d.ignored}>
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
    </div>
  );
};

export default FlightRequirementListPage;

//==============================================================================================

const dummyDatas = [
  new FlightRequirement({
    id: '125',
    definition: { label: 'DXB1', flightNumber: 'W5 0060', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinition,
    scope: {
      blockTime: 120,
      times: [{ stdLowerBound: new Daytime(500), stdUpperBound: new Daytime(600) }, { stdLowerBound: new Daytime(720), stdUpperBound: new Daytime(820) }] as ReadonlyArray<
        Readonly<FlightTime>
      >,
      slot: true,
      slotComment: 'no comment .....',
      required: true
    } as FlightScope,
    days: [
      {
        notes: 'note1',
        day: 1,
        scope: {
          blockTime: 120,
          times: [{ stdLowerBound: new Daytime(500), stdUpperBound: new Daytime(600) }, { stdLowerBound: new Daytime(720), stdUpperBound: new Daytime(820) }] as ReadonlyArray<
            Readonly<FlightTime>
          >,
          slot: true,
          slotComment: 'no comment .....',
          required: true
        } as FlightScope,
        flight: {}
      },
      {
        notes: 'note3',
        day: 3,
        scope: {
          blockTime: 120,
          times: [{ stdLowerBound: new Daytime(500), stdUpperBound: new Daytime(600) }, { stdLowerBound: new Daytime(720), stdUpperBound: new Daytime(820) }] as ReadonlyArray<
            Readonly<FlightTime>
          >,
          slot: true,
          slotComment: 'no comment .....',
          required: false
        } as FlightScope,
        flight: {}
      },
      {
        notes: 'note5',
        day: 5,
        scope: {
          blockTime: 120,
          times: [{ stdLowerBound: new Daytime(500), stdUpperBound: new Daytime(600) }, { stdLowerBound: new Daytime(720), stdUpperBound: new Daytime(820) }] as ReadonlyArray<
            Readonly<FlightTime>
          >,
          slot: true,
          slotComment: 'no comment .....',
          required: true
        } as FlightScope,
        flight: {}
      }
    ] as WeekdayFlightRequirement[],
    ignored: true
  } as FlightRequirementModel),
  new FlightRequirement({
    id: '126',
    definition: { label: 'DXB1', flightNumber: 'W5 0061', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinition,
    scope: {
      blockTime: 120,
      times: [{ stdLowerBound: new Daytime(500), stdUpperBound: new Daytime(600) }, { stdLowerBound: new Daytime(720), stdUpperBound: new Daytime(820) }] as ReadonlyArray<
        Readonly<FlightTime>
      >,
      slot: true,
      slotComment: 'no comment .....',
      required: true
    } as FlightScope,
    days: [
      {
        notes: 'note1',
        day: 1,
        scope: {
          blockTime: 120,
          times: [{ stdLowerBound: new Daytime(500), stdUpperBound: new Daytime(600) }, { stdLowerBound: new Daytime(720), stdUpperBound: new Daytime(820) }] as ReadonlyArray<
            Readonly<FlightTime>
          >,
          slot: true,
          slotComment: 'no comment .....',
          required: true
        } as FlightScope,
        flight: {}
      },
      {
        notes: 'note3',
        day: 3,
        scope: {
          blockTime: 120,
          times: [{ stdLowerBound: new Daytime(500), stdUpperBound: new Daytime(600) }, { stdLowerBound: new Daytime(720), stdUpperBound: new Daytime(820) }] as ReadonlyArray<
            Readonly<FlightTime>
          >,
          slot: true,
          slotComment: 'no comment .....',
          required: false
        } as FlightScope,
        flight: {}
      },
      {
        notes: 'note5',
        day: 5,
        scope: {
          blockTime: 120,
          times: [{ stdLowerBound: new Daytime(500), stdUpperBound: new Daytime(600) }, { stdLowerBound: new Daytime(720), stdUpperBound: new Daytime(820) }] as ReadonlyArray<
            Readonly<FlightTime>
          >,
          slot: true,
          slotComment: 'no comment .....',
          required: true
        } as FlightScope,
        flight: {}
      }
    ] as WeekdayFlightRequirement[],
    ignored: false
  } as FlightRequirementModel),
  new FlightRequirement({
    id: '127',
    definition: { label: 'IST1', flightNumber: 'W5 0113', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinition,
    scope: {
      blockTime: 120,
      times: [{ stdLowerBound: new Daytime(500), stdUpperBound: new Daytime(600) }, { stdLowerBound: new Daytime(720), stdUpperBound: new Daytime(820) }] as ReadonlyArray<
        Readonly<FlightTime>
      >,
      slot: true,
      slotComment: 'no comment .....',
      required: true
    } as FlightScope,
    days: [
      {
        notes: 'note2',
        day: 2,
        scope: {
          blockTime: 120,
          times: [{ stdLowerBound: new Daytime(500), stdUpperBound: new Daytime(600) }, { stdLowerBound: new Daytime(720), stdUpperBound: new Daytime(820) }] as ReadonlyArray<
            Readonly<FlightTime>
          >,
          slot: true,
          slotComment: 'no comment .....',
          required: true
        } as FlightScope,
        flight: {}
      },
      {
        notes: 'note4',
        day: 4,
        scope: {
          blockTime: 120,
          times: [{ stdLowerBound: new Daytime(500), stdUpperBound: new Daytime(600) }, { stdLowerBound: new Daytime(720), stdUpperBound: new Daytime(820) }] as ReadonlyArray<
            Readonly<FlightTime>
          >,
          slot: true,
          slotComment: 'no comment .....',
          required: true
        } as FlightScope,
        flight: {}
      },
      {
        notes: 'note6',
        day: 6,
        scope: {
          blockTime: 120,
          times: [{ stdLowerBound: new Daytime(500), stdUpperBound: new Daytime(600) }, { stdLowerBound: new Daytime(720), stdUpperBound: new Daytime(820) }] as ReadonlyArray<
            Readonly<FlightTime>
          >,
          slot: true,
          slotComment: 'no comment .....',
          required: true
        } as FlightScope,
        flight: {}
      }
    ] as WeekdayFlightRequirement[],
    ignored: false
  } as FlightRequirementModel)
] as ReadonlyArray<FlightRequirement>;
