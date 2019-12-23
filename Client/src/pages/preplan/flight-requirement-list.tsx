import React, { FC, useState, useContext, useEffect, Fragment } from 'react';
import { Theme, Paper, Tabs, Tab, IconButton, Grid, Typography, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { PreplanContext, ReloadPreplanContext } from 'src/pages/preplan';
import { fade } from '@material-ui/core/styles';
import Search, { filterOnProperties } from 'src/components/Search';
import { Add as AddIcon, Clear as ClearIcon, TrendingFlat as TrendingFlatIcon } from '@material-ui/icons';
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
import { dataTypes } from 'src/utils/DataType';

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
  },
  pointer: {
    cursor: 'pointer'
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
        <Tab value="INCLUDED" label={`Included (${numberOfIncludedFlightRequirements})`} />
        <Tab value="IGNORED" label={`Ignored (${numberOfIgnoredFlightRequirements})`} />
        <Search outlined onQueryChange={setQuery} />
        <IconButton color="primary" title="Add Flight" onClick={onAddFlightRequirement} disabled={preplan.readonly}>
          <AddIcon fontSize="large" />
        </IconButton>
      </Tabs>

      {filteredFlightRequirments.slice(pageNumber * rowsPerPage, (pageNumber + 1) * rowsPerPage).map(flightRequirement => (
        <Paper key={flightRequirement.id} className={classNames(classes.flightRequirmentStyle, flightRequirement.ignored && classes.paperDisableStyle)}>
          <Grid container direction="row" justify="space-between" alignItems="center" className={classes.flightDefinitionStyle}>
            <Grid item xs={8} classes={{ root: classNames(flightRequirement.ignored && classes.disableOpacityStyle) }} container direction="row" justify="flex-start" spacing={1}>
              <Grid item xs={10} classes={{ root: classes.pointer }} onClick={() => onEditFlightRequirement(flightRequirement)}>
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
            <Grid item xs={4} container justify="flex-end" alignItems="center" spacing={1}>
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
                        flightRequirement.extractModel(flightRequirementModel => ({ ...flightRequirementModel, ignored: !flightRequirement.ignored })),
                        [],
                        flightRequirement.ignored
                          ? flightRequirement.days.map<NewFlightModel>(d => ({
                              day: d.day,
                              aircraftRegisterId: dataTypes
                                .preplanAircraftRegister(preplan.aircraftRegisters)
                                .convertBusinessToModelOptional(d.aircraftSelection.backupAircraftRegister),
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
                  disabled={preplan.readonly}
                />
              </Grid>
              <Grid item className={classNames(flightRequirement.ignored && classes.disableOpacityStyle)}>
                <IconButton size="small" disabled={flightRequirement.ignored || preplan.readonly} onClick={() => onRemoveFlightRequirement(flightRequirement)}>
                  <ClearIcon fontSize="large" />
                </IconButton>
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
