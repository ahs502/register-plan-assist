import React, { FC, Fragment, useState, useContext } from 'react';
import { Theme, Portal, Paper, Tabs, Tab, IconButton, Grid, TableHead, TableRow, TableCell, Table, TableBody, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { NavBarToolsContainerContext } from '../preplan';
import FlightRequirement, { WeekdayFlightRequirement, FlightDefinition, FlightScope } from '../../view-models/FlightRequirment';
import { FlightRequirementModel, FlightTime } from '../../business/FlightRequirement';
import { Daytime } from '../../business/Daytime';
import Search from '../../components/Search';
import { DoneAll as FinilizedIcon, Add as AddIcon, Edit as EditIcon, Clear as ClearIcon } from '@material-ui/icons';

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

  const classes = useStyles();

  return (
    <div className={classes.contentPage}>
      <Tabs value={tab} indicatorColor="primary" textColor="primary" onChange={(event, tab) => setTab(tab)}>
        <Tab value="ALL" label={'ALL(' + dummyDatas.length + ')'} />
        <Tab value="INCLUDE" label="Public" />
        <Tab value="INGORE" label="INGORE" />
        <Search outlined />
        <IconButton color="primary" title="Add Preplan">
          <AddIcon fontSize="large" />
        </IconButton>
      </Tabs>

      {dummyDatas.map(d => {
        return (
          <Paper key={d.id} className={classes.flightRequirmentStyle}>
            <Grid container direction="row" justify="space-between" alignItems="center" className={classes.flightDefinitionStyle}>
              <Grid item>
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
                <ClearIcon />
              </Grid>
            </Grid>
            <Grid container>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>WeekDay</TableCell>
                    <TableCell>BlockTime</TableCell>
                    <TableCell>Allowed Registers</TableCell>
                    <TableCell>Forbidden Registers</TableCell>
                    <TableCell>STD Lower Bound</TableCell>
                    <TableCell>STD Upper Bound</TableCell>
                    <TableCell>Requierd</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.days.map(item => {
                    return (
                      <TableRow key={'days' + d.id}>
                        <TableCell>{item.day}</TableCell>
                        <TableCell>{item.scope.blockTime}</TableCell>
                        <TableCell>'GPS, MMO'</TableCell>
                        <TableCell>"MMH"</TableCell>
                        <TableCell>
                          {item.scope.times.map(t => {
                            return (
                              <div key={'timescopeLowerBound' + d.id}>
                                <div>{t.stdLowerBound.minutes}</div>
                              </div>
                            );
                          })}
                        </TableCell>
                        <TableCell>
                          {item.scope.times.map(t => {
                            return (
                              <div key={'timescopeUpperBound' + d.id}>
                                <div>{t.stdUpperBound.minutes}</div>
                              </div>
                            );
                          })}
                        </TableCell>
                        <TableCell>{item.scope.required}</TableCell>
                        <TableCell>Action</TableCell>
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
      times: [
        { stdLowerBound: { minutes: 540 } as Daytime, stdUpperBound: { minutes: 600 } as Daytime },
        { stdLowerBound: { minutes: 720 } as Daytime, stdUpperBound: { minutes: 840 } as Daytime }
      ] as ReadonlyArray<Readonly<FlightTime>>,
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
          times: [
            { stdLowerBound: { minutes: 540 } as Daytime, stdUpperBound: { minutes: 600 } as Daytime },
            { stdLowerBound: { minutes: 720 } as Daytime, stdUpperBound: { minutes: 840 } as Daytime }
          ] as ReadonlyArray<Readonly<FlightTime>>,
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
          times: [
            { stdLowerBound: { minutes: 540 } as Daytime, stdUpperBound: { minutes: 600 } as Daytime },
            { stdLowerBound: { minutes: 720 } as Daytime, stdUpperBound: { minutes: 840 } as Daytime }
          ] as ReadonlyArray<Readonly<FlightTime>>,
          slot: true,
          slotComment: 'no comment .....',
          required: true
        } as FlightScope,
        flight: {}
      },
      {
        notes: 'note5',
        day: 5,
        scope: {
          blockTime: 120,
          times: [
            { stdLowerBound: { minutes: 540 } as Daytime, stdUpperBound: { minutes: 600 } as Daytime },
            { stdLowerBound: { minutes: 720 } as Daytime, stdUpperBound: { minutes: 840 } as Daytime }
          ] as ReadonlyArray<Readonly<FlightTime>>,
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
    id: '125',
    definition: { label: 'DXB1', flightNumber: 'W5 0061', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinition,
    scope: {
      blockTime: 120,
      times: [
        { stdLowerBound: { minutes: 340 } as Daytime, stdUpperBound: { minutes: 400 } as Daytime },
        { stdLowerBound: { minutes: 520 } as Daytime, stdUpperBound: { minutes: 640 } as Daytime }
      ] as ReadonlyArray<Readonly<FlightTime>>,
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
          times: [
            { stdLowerBound: { minutes: 340 } as Daytime, stdUpperBound: { minutes: 400 } as Daytime },
            { stdLowerBound: { minutes: 520 } as Daytime, stdUpperBound: { minutes: 640 } as Daytime }
          ] as ReadonlyArray<Readonly<FlightTime>>,
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
          times: [
            { stdLowerBound: { minutes: 340 } as Daytime, stdUpperBound: { minutes: 400 } as Daytime },
            { stdLowerBound: { minutes: 520 } as Daytime, stdUpperBound: { minutes: 640 } as Daytime }
          ] as ReadonlyArray<Readonly<FlightTime>>,
          slot: true,
          slotComment: 'no comment .....',
          required: true
        } as FlightScope,
        flight: {}
      },
      {
        notes: 'note5',
        day: 5,
        scope: {
          blockTime: 120,
          times: [
            { stdLowerBound: { minutes: 540 } as Daytime, stdUpperBound: { minutes: 600 } as Daytime },
            { stdLowerBound: { minutes: 720 } as Daytime, stdUpperBound: { minutes: 840 } as Daytime }
          ] as ReadonlyArray<Readonly<FlightTime>>,
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
    id: '125',
    definition: { label: 'IST1', flightNumber: 'W5 0113', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinition,
    scope: {
      blockTime: 120,
      times: [
        { stdLowerBound: { minutes: 640 } as Daytime, stdUpperBound: { minutes: 700 } as Daytime },
        { stdLowerBound: { minutes: 820 } as Daytime, stdUpperBound: { minutes: 940 } as Daytime }
      ] as ReadonlyArray<Readonly<FlightTime>>,
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
          times: [
            { stdLowerBound: { minutes: 640 } as Daytime, stdUpperBound: { minutes: 700 } as Daytime },
            { stdLowerBound: { minutes: 820 } as Daytime, stdUpperBound: { minutes: 940 } as Daytime }
          ] as ReadonlyArray<Readonly<FlightTime>>,
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
          times: [
            { stdLowerBound: { minutes: 640 } as Daytime, stdUpperBound: { minutes: 700 } as Daytime },
            { stdLowerBound: { minutes: 820 } as Daytime, stdUpperBound: { minutes: 940 } as Daytime }
          ] as ReadonlyArray<Readonly<FlightTime>>,
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
          times: [
            { stdLowerBound: { minutes: 640 } as Daytime, stdUpperBound: { minutes: 700 } as Daytime },
            { stdLowerBound: { minutes: 820 } as Daytime, stdUpperBound: { minutes: 940 } as Daytime }
          ] as ReadonlyArray<Readonly<FlightTime>>,
          slot: true,
          slotComment: 'no comment .....',
          required: true
        } as FlightScope,
        flight: {}
      }
    ] as WeekdayFlightRequirement[],
    ignored: false
  } as FlightRequirementModel)
];
