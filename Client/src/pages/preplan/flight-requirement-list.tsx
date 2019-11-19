import React, { FC, useState, useContext, useEffect, Fragment } from 'react';
import { Theme, Paper, Tabs, Tab, IconButton, Grid, Typography, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { PreplanContext, ReloadPreplanContext } from 'src/pages/preplan';
import { fade } from '@material-ui/core/styles';
import Search, { filterOnProperties } from 'src/components/Search';
import { Add as AddIcon, Edit as EditIcon, Clear as ClearIcon, TrendingFlat as TrendingFlatIcon } from '@material-ui/icons';
import classNames from 'classnames';
import Weekday from '@core/types/Weekday';
import TablePagination from '@material-ui/core/TablePagination';
import ProgressSwitch from 'src/components/ProgressSwitch';
import { useSnackbar } from 'notistack';
import TargetObjectionStatus from 'src/components/preplan/TargetObjectionStatus';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import TablePaginationActions from 'src/components/TablePaginationActions';
import FlightRequirementService from 'src/services/FlightRequirementService';
import NewFlightModel from '@core/models/flight/NewFlightModel';
import FlightLegModel from '@core/models/flight/FlightLegModel';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';
import FlightRequirementLegModel from '@core/models/flight-requirement/FlightRequirementLegModel';
import DayFlightRequirementModel from '@core/models/flight-requirement/DayFlightRequirementModel';
import DayFlightRequirementLegModel from '@core/models/flight-requirement/DayFlightRequirementLegModel';

const useStyles = makeStyles((theme: Theme) => ({
  contentPage: {
    maxWidth: '1176px',
    margin: 'auto'
  },
  flightRequirmentStyle: {
    marginTop: theme.spacing(2)
  },
  flightDefinitionStyle: {
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
  stdStyle: {
    '& div:not(last-child)': {
      borderBottom: '1px solid ',
      borderBottomColor: theme.palette.grey[300]
    }
  },
  stdPadding: {
    padding: theme.spacing(0)
  },
  divContent: {
    justifyContent: 'center',
    display: 'flex'
  },
  disableDaysOpacityStyle: {
    opacity: 0.25
  }
}));

interface FlightRequirementIncludeSwitchLoadingStatus {
  [id: string]: boolean;
}

export interface FlightRequirementListPageProps {
  onAddFlightRequirement: () => void;
  onRemoveFlightRequirement: (flightRequirement: FlightRequirement) => void;
  onEditFlightRequirement: (flightRequirement: FlightRequirement) => void;
}

const FlightRequirementListPage: FC<FlightRequirementListPageProps> = React.memo(({ onAddFlightRequirement, onRemoveFlightRequirement, onEditFlightRequirement }) => {
  const preplan = useContext(PreplanContext);
  const reloadPreplan = useContext(ReloadPreplanContext);

  const [tab, setTab] = useState<'ALL' | 'INCLUDED' | 'IGNORED'>('ALL');
  const [query, setQuery] = useState<readonly string[]>([]);
  const [filteredFlightRequirments, setFilteredFlightRequirments] = useState<readonly FlightRequirement[]>(preplan.flightRequirements);
  const [flightRequirementIncludeSwitchLoadingStatus, setFlightRequirementIncludeSwitchLoadingStatus] = useState<FlightRequirementIncludeSwitchLoadingStatus>({});
  const [pageNumber, setPageNumber] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const filteredFlightRequirements = filterOnProperties(preplan.flightRequirements, query, 'label')
      .filter(f => tab === 'ALL' || (tab === 'INCLUDED' && !f.ignored) || (tab === 'IGNORED' && f.ignored))
      .orderBy(n => n.label);
    setFilteredFlightRequirments(filteredFlightRequirements);
    setPageNumber(0);
  }, [preplan, tab, query]);

  const numberOfFlightRequirements = preplan.flightRequirements.length;
  const numberOfIncludedFlightRequirements = preplan.flightRequirements.filter(f => !f.ignored).length;
  const numberOfIgnoredFlightRequirements = numberOfFlightRequirements - numberOfIncludedFlightRequirements;

  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  return (
    <div className={classes.contentPage}>
      <Tabs className={classes.tabsStyle} value={tab} indicatorColor="primary" textColor="primary" onChange={(e, t) => setTab(t)}>
        <Tab value="ALL" label={`All (${numberOfFlightRequirements})`} />
        <Tab value="INCLUDE" label={`Included (${numberOfIncludedFlightRequirements})`} />
        <Tab value="IGNORE" label={`Ignored (${numberOfIgnoredFlightRequirements})`} />
        <Search outlined onQueryChange={setQuery} />
        <IconButton color="primary" title="Add Flight Requirment" onClick={onAddFlightRequirement}>
          <AddIcon fontSize="large" />
        </IconButton>
      </Tabs>

      {filteredFlightRequirments.slice(pageNumber * rowsPerPage, (pageNumber + 1) * rowsPerPage).map(flightRequirement => (
        <Paper key={flightRequirement.id} className={classNames(classes.flightRequirmentStyle, flightRequirement.ignored && classes.paperDisableStyle)}>
          <Grid container direction="row" justify="space-between" alignItems="center" className={classes.flightDefinitionStyle}>
            <Grid item className={classNames(flightRequirement.ignored && classes.disableOpacityStyle)} xs={8}>
              <Grid container direction="row" justify="flex-start" alignItems="center" spacing={1}>
                <Grid item xs={10}>
                  <Typography display="inline" variant="h6">
                    {flightRequirement.label}
                    {!!flightRequirement.category && (
                      <Typography display="inline" variant="body2">
                        &nbsp;&nbsp;&nbsp;
                        {flightRequirement.category}
                      </Typography>
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <TargetObjectionStatus target={flightRequirement}></TargetObjectionStatus>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container direction="row" justify="center" alignItems="center" spacing={1}>
                <Grid item xs={5}>
                  {Array.range(0, 6).map(n => {
                    const dayFlightRequirement = flightRequirement.days.find(d => d.day === n);
                    return (
                      <Typography
                        color={!dayFlightRequirement || dayFlightRequirement.rsx === 'REAL' || dayFlightRequirement.rsx === 'STB1' ? 'primary' : 'secondary'}
                        className={classNames({ [classes.disableDaysOpacityStyle]: !dayFlightRequirement })}
                        variant="subtitle1"
                        key={n}
                        display="inline"
                      >
                        {Weekday[n][0]}&nbsp;&nbsp;
                      </Typography>
                    );
                  })}
                </Grid>
                <Grid item>Include</Grid>
                <Grid item>
                  <ProgressSwitch
                    checked={!flightRequirement.ignored}
                    loading={flightRequirementIncludeSwitchLoadingStatus[flightRequirement.id]}
                    onChange={async () => {
                      if (flightRequirementIncludeSwitchLoadingStatus[flightRequirement.id]) return;
                      setFlightRequirementIncludeSwitchLoadingStatus({ ...flightRequirementIncludeSwitchLoadingStatus, [flightRequirement.id]: true });
                      try {
                        const newPreplanModel = await FlightRequirementService.edit(
                          preplan.id,
                          {
                            id: flightRequirement.id,
                            label: flightRequirement.label,
                            category: flightRequirement.category,
                            stcId: flightRequirement.stc.id,
                            aircraftSelection: {
                              includedIdentities: flightRequirement.aircraftSelection.includedIdentities.map<AircraftIdentityModel>(i => ({
                                type: i.type,
                                entityId: i.entity.id
                              })),
                              excludedIdentities: flightRequirement.aircraftSelection.excludedIdentities.map<AircraftIdentityModel>(i => ({
                                type: i.type,
                                entityId: i.entity.id
                              }))
                            },
                            rsx: flightRequirement.rsx,
                            notes: flightRequirement.notes,
                            ignored: !flightRequirement.ignored, // The only place to change.
                            route: flightRequirement.route.map<FlightRequirementLegModel>(l => ({
                              flightNumber: l.flightNumber.standardFormat,
                              departureAirportId: l.departureAirport.id,
                              arrivalAirportId: l.arrivalAirport.id,
                              blockTime: l.blockTime,
                              stdLowerBound: l.stdLowerBound.minutes,
                              stdUpperBound: l.stdUpperBound === undefined ? undefined : l.stdUpperBound.minutes,
                              originPermission: l.originPermission,
                              destinationPermission: l.destinationPermission
                            })),
                            days: flightRequirement.days.map<DayFlightRequirementModel>((d, index) => ({
                              aircraftSelection: {
                                includedIdentities: d.aircraftSelection.includedIdentities.map(i => ({
                                  type: i.type,
                                  entityId: i.entity.id
                                })),
                                excludedIdentities: d.aircraftSelection.excludedIdentities.map(i => ({
                                  type: i.type,
                                  entityId: i.entity.id
                                }))
                              },
                              rsx: d.rsx,
                              day: index,
                              notes: d.notes,
                              route: d.route.map<DayFlightRequirementLegModel>(l => ({
                                blockTime: l.blockTime,
                                stdLowerBound: l.stdLowerBound.minutes,
                                stdUpperBound: l.stdUpperBound === undefined ? undefined : l.stdUpperBound.minutes,
                                originPermission: l.originPermission,
                                destinationPermission: l.destinationPermission
                              }))
                            }))
                          },
                          [],
                          flightRequirement.ignored
                            ? flightRequirement.days.map<NewFlightModel>(d => ({
                                day: d.day,
                                aircraftRegisterId: d.aircraftSelection.backupAircraftRegister && d.aircraftSelection.backupAircraftRegister.id,
                                legs: d.route.map<FlightLegModel>(l => ({
                                  std: l.stdLowerBound.minutes
                                }))
                              }))
                            : []
                        );
                        await reloadPreplan(newPreplanModel);
                      } catch (reason) {
                        enqueueSnackbar(String(reason), { variant: 'error' });
                      }
                      setFlightRequirementIncludeSwitchLoadingStatus(flightRequirementIncludeSwitchLoadingStatus => ({
                        ...flightRequirementIncludeSwitchLoadingStatus,
                        [flightRequirement.id]: false
                      }));
                    }}
                    color="primary"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                </Grid>

                <Grid item className={classNames(flightRequirement.ignored && classes.disableOpacityStyle)}>
                  <IconButton size="small" disabled={flightRequirement.ignored} onClick={() => onEditFlightRequirement(flightRequirement)}>
                    <EditIcon fontSize="large" />
                  </IconButton>
                </Grid>
                <Grid item className={classNames(flightRequirement.ignored && classes.disableOpacityStyle)}>
                  <IconButton size="small" disabled={flightRequirement.ignored} onClick={() => onRemoveFlightRequirement(flightRequirement)}>
                    <ClearIcon fontSize="large" />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider variant="middle" />

          <Grid container direction="row" alignItems="center" className={classes.flightDefinitionStyle}>
            <Typography display="inline">{flightRequirement.route[0].departureAirport.name}</Typography>
            {flightRequirement.route.map(routeLeg => (
              <Fragment key={routeLeg.index}>
                &nbsp;&nbsp;&nbsp;
                <TrendingFlatIcon />
                &nbsp;&nbsp;&nbsp;
                <Typography display="inline">{routeLeg.arrivalAirport.name}</Typography>
              </Fragment>
            ))}
          </Grid>
        </Paper>
      ))}

      <br />

      <TablePagination
        classes={{ root: classes.divContent }}
        rowsPerPageOptions={[10, 20, 50]}
        count={filteredFlightRequirments.length}
        onChangePage={(e, pageNumber) => setPageNumber(pageNumber)}
        page={pageNumber}
        rowsPerPage={rowsPerPage}
        onChangeRowsPerPage={e => {
          const newRowsPerPage = Number(e.target.value);
          setRowsPerPage(newRowsPerPage);
          setPageNumber(0);
        }}
        ActionsComponent={TablePaginationActions}
      />
    </div>
  );
});

export default FlightRequirementListPage;
