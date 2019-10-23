import React, { FC, useState, useContext, useEffect } from 'react';
import { Theme, Paper, Tabs, Tab, IconButton, Grid, TableHead, TableRow, TableCell, Table, TableBody, Typography, Switch, Button, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { NavBarToolsContainerContext } from 'src/pages/preplan';
import { fade } from '@material-ui/core/styles';
import Search from 'src/components/Search';
import { DoneAll as FinilizedIcon, Add as AddIcon, Edit as EditIcon, Clear as ClearIcon, Done as DoneIcon, TrendingFlat as TrendingFlatIcon } from '@material-ui/icons';
import classNames from 'classnames';
import Weekday from '@core/types/Weekday';
import TablePagination from '@material-ui/core/TablePagination';
import TablePaginationActions from 'src/components/PaginationAction';
import FlightRequirement from 'src/business/flights/FlightRequirement';
import WeekdayFlightRequirement from 'src/business/flights/WeekdayFlightRequirement';
import Preplan from 'src/business/Preplan';
import PreplanService from 'src/services/PreplanService';
import ProgressSwitch from 'src/components/ProgressSwitch';
import { useSnackbar, VariantType } from 'notistack';
import { parseMinute } from 'src/utils/model-parsers';
import TargetObjectionStatus from 'src/components/preplan/TargetObjectionStatus';
import Objectionable from 'src/business/constraints/Objectionable';

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

interface IncludeLoadingStatus {
  [id: string]: boolean;
  value: boolean;
}

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
    //console.log(flightRequirements);

    const navBarToolsContainer = useContext(NavBarToolsContainerContext);
    const [tab, setTab] = useState<Tab>('ALL');
    const [searchValue, setSearchValue] = useState<readonly string[]>([]);
    const [numberOfAllFR, setNumberOfAllFr] = useState(0);
    const [numberOfIgnoreFR, setNumberOfIgnoreFr] = useState(0);
    const [filterFlightRequirment, setFilterFlightRequirment] = useState<ReadonlyArray<FlightRequirement>>(flightRequirements);
    const [includeLoadingStatus, setIncludeLoadingStatus] = useState<IncludeLoadingStatus>({} as IncludeLoadingStatus);
    const [pageNumber, setPageNumber] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(10);

    const { enqueueSnackbar } = useSnackbar();

    function snackbar(message: string, variant: VariantType) {
      // variant could be success, error, warning, info, or default
      enqueueSnackbar(message, { variant });
    }
    useEffect(() => {
      filterFlightRequiermentBySelectedTab(filterOnProperties(searchValue), tab);
    }, [flightRequirements, tab, searchValue, preplan.flights, preplan.flightPacks]);

    const classes = useStyles();

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

      if (t === 'ALL') return setFilterFlightRequirment(filterItem.orderBy(n => n.definition.label));
      if (t === 'INCLUDE') return setFilterFlightRequirment(filterItem.filter(fr => fr.ignored === false).orderBy(n => n.definition.label));
      if (t === 'IGNORE') return setFilterFlightRequirment(filterItem.filter(fr => fr.ignored === true).orderBy(n => n.definition.label));
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
          }}
        >
          <Tab value="ALL" label={'ALL (' + numberOfAllFR + ')'} />
          <Tab value="INCLUDE" label={'INCLUDE (' + (numberOfAllFR - numberOfIgnoreFR) + ')'} />
          <Tab value="IGNORE" label={'IGNORE (' + numberOfIgnoreFR + ')'} />
          <Search
            outlined
            onQueryChange={query => {
              setSearchValue(query);
            }}
          />
          <IconButton color="primary" title="Add Flight Requirment" onClick={() => onAddFlightRequirement()}>
            <AddIcon fontSize="large" />
          </IconButton>
        </Tabs>

        {filterFlightRequirment.slice(pageNumber * rowPerPage, (pageNumber + 1) * rowPerPage).map(d => {
          return (
            <Paper key={d.id} className={classNames(classes.flightRequirmentStyle, d.ignored && classes.paperDisableStyle)}>
              <Grid container direction="row" justify="space-between" alignItems="center" className={classes.flightDefinitionStyle}>
                <Grid item className={classNames(d.ignored && classes.disableOpacityStyle)} xs={8}>
                  <Grid container direction="row" justify="flex-start" alignItems="center" spacing={1}>
                    <Grid item xs={10}>
                      <Typography display="inline" variant="h6">
                        DOH(BND/PGU)
                        <Typography display="inline" variant="body2">
                          Category
                        </Typography>
                      </Typography>
                    </Grid>

                    <Grid item xs={2}>
                      <TargetObjectionStatus target={{} as Objectionable} onClick={() => {}}></TargetObjectionStatus>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <Grid container direction="row" justify="center" alignItems="center" spacing={1}>
                    <Grid item xs={5}>
                      {Array.range(0, 6).map(n => (
                        <Typography color="primary" variant="subtitle1" key={n} display="inline">
                          {Weekday[n][0]}&nbsp;&nbsp;
                        </Typography>
                      ))}
                    </Grid>
                    <Grid item>Include</Grid>
                    <Grid item>
                      <ProgressSwitch
                        checked={!d.ignored}
                        loading={includeLoadingStatus[d.id]}
                        onChange={async e => {
                          if (includeLoadingStatus[d.id]) return;

                          setIncludeLoadingStatus(state => ({ ...state, [d.id]: true }));

                          const newFrModel = d.extractModel({ ignored: !e.target.checked });
                          const result = await PreplanService.editFlightRequirements([newFrModel]);

                          if (result.message) {
                            snackbar(result.message, 'warning');
                          } else {
                            preplan.mergeFlightRequirements(...result.value!);
                          }

                          setIncludeLoadingStatus(state => ({ ...state, [d.id]: false }));
                        }}
                        color="primary"
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                      />
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

              <Divider variant="middle" />
              <Grid container direction="row" alignItems="center" className={classes.flightDefinitionStyle}>
                <Typography display="inline">IKA</Typography>
                <TrendingFlatIcon></TrendingFlatIcon>
                <Typography display="inline">DOH</Typography>
                <TrendingFlatIcon></TrendingFlatIcon>
                <Typography display="inline">BND</Typography>
                <TrendingFlatIcon></TrendingFlatIcon>
                <Typography display="inline">DOH</Typography>
                <TrendingFlatIcon></TrendingFlatIcon>
                <Typography display="inline">PGU</Typography>
                <TrendingFlatIcon></TrendingFlatIcon>
                <Typography display="inline">DOH</Typography>
                <TrendingFlatIcon></TrendingFlatIcon>
                <Typography display="inline">IKA</Typography>
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
