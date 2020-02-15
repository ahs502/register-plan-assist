import React, { FC, useState, Fragment, useEffect, useMemo, useContext } from 'react';
import {
  Theme,
  InputLabel,
  TextField,
  TableHead,
  TableCell,
  Table,
  TableRow,
  TableBody,
  Button,
  Paper,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox,
  Box
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MasterData, { Airport } from 'src/business/master-data';
import Weekday from '@core/types/Weekday';
import MultiSelect from 'src/components/MultiSelect';
import classNames from 'classnames';
import { CallMade as ConnectionIcon, Publish as ExportToExcelIcon } from '@material-ui/icons';
import { ExcelExport, ExcelExportColumn, ExcelExportColumnGroup } from '@progress/kendo-react-excel-export';
import { CellOptions } from '@progress/kendo-react-excel-export/dist/npm/ooxml/CellOptionsInterface';
import { dataTypes } from 'src/utils/DataType';
import RefiningTextField from 'src/components/RefiningTextField';
import Validation from '@core/node_modules/@ahs502/validation/dist/Validation';
import AutoComplete from 'src/components/AutoComplete';
import { PreplanContext } from 'src/pages/preplan';
import Week from 'src/business/Week';
import SelectWeeks, { WeekSelection } from 'src/components/preplan/SelectWeeks';
import PreplanService from 'src/services/PreplanService';
import { useSnackbar } from 'notistack';
import persistant from 'src/utils/persistant';

const errorPaperSize = 250;
const character = {
  zeroConnection: '–'
};

const useStyles = makeStyles((theme: Theme) => ({
  selectWeekWrapper: {
    margin: theme.spacing(0, 0, 1, 0),
    padding: 0
  },
  west: {
    backgroundColor: '#FFCC99'
  },
  header: {
    backgroundColor: '#F4B084'
  },
  airportHeader: {
    backgroundColor: '#FBE0CE'
  },
  connectionHeader: {
    backgroundColor: '#C6EFCE'
  },
  tableContainer: {
    width: '100%',
    overflowX: 'scroll'
  },
  export: {
    width: 200
  },
  connectionTo: {
    transform: 'rotate(90deg)',
    top: 13,
    position: 'relative',
    left: 10
  },
  connectionFrom: {
    top: 13,
    position: 'relative',
    right: 10
  },
  connectionEastAirline: {
    top: 16,
    position: 'relative'
  },
  boarder: {
    borderColor: theme.palette.grey[400],
    borderStyle: 'solid',
    borderWidth: 1,
    padding: theme.spacing(1, 0.5)
  },
  removeRightBoarder: {
    borderRight: 'none'
  },
  removeLeftBoarder: {
    borderLeft: 'none'
  },
  main: {
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(3)
  },
  marginBottom1: {
    marginBottom: theme.spacing(1)
  },
  marginBottom2: {
    marginBottom: theme.spacing(2)
  },
  transform180: {
    transform: 'rotate(180deg)'
  },
  connectionTime: {
    width: 200,
    marginRight: theme.spacing(1)
  },
  marginRight1: {
    marginRight: theme.spacing(1)
  },
  zeroNumberOfConnection: {
    color: '#C4BD97'
  },
  errorPaper: {
    height: errorPaperSize
  },
  errorPaperMessage: {
    lineHeight: `${errorPaperSize}px`
  }
}));

interface ViewState {
  westAirportsAirline: Airline;
  eastAirportsAirline: Airline;
  eastAirports: Airport[];
  westAirports: Airport[];
  maxConnectionTime: string;
  minConnectionTime: string;
  autoCommit: boolean;
  commitMessage: string;
}

interface ReportDateRangeState {
  startDate: string;
  endDate: string;
}

class ConnectionReportValidation extends Validation<
  | 'WEST_AIRPORT_EXISTS'
  | 'EAST_AIRPORT_EXISTS'
  | 'START_DATE_EXISTS'
  | 'START_DATE_IS_VALID'
  | 'START_DATE_IS_NOT_AFTER_END_DATE'
  | 'END_DATE_EXISTS'
  | 'END_DATE_IS_VALID'
  | 'END_DATE_IS_NOT_BEFORE_START_DATE'
  | 'BASE_DATE_EXISTS'
  | 'BASE_DATE_IS_VALID'
  | 'BASE_DATE_BETWEEN_START_DATE_AND_END_DATE'
  | 'EAST_AIRLINE_EXISTS'
  | 'WEST_AIRLINE_EXISTS'
> {
  constructor({ eastAirportsAirline, westAirportsAirline, eastAirports, westAirports }: ViewState, { startDate, endDate }: ReportDateRangeState) {
    super(
      validator => {
        validator.check('EAST_AIRPORT_EXISTS', eastAirports.length > 0);
        validator.check('WEST_AIRPORT_EXISTS', westAirports.length > 0);
        validator.check('START_DATE_EXISTS', !!startDate).check('START_DATE_IS_VALID', () => dataTypes.utcDate.checkView(startDate));
        validator.check('END_DATE_EXISTS', !!endDate).check('END_DATE_IS_VALID', () => dataTypes.utcDate.checkView(endDate));
        validator.when('START_DATE_IS_VALID', 'END_DATE_IS_VALID').then(() => {
          const ok = dataTypes.utcDate.convertViewToModel(startDate) <= dataTypes.utcDate.convertViewToModel(endDate);
          validator.check('START_DATE_IS_NOT_AFTER_END_DATE', ok, 'Can not be after end date.');
          validator.check('END_DATE_IS_NOT_BEFORE_START_DATE', ok, 'Can not be before start date.');
          validator.check('EAST_AIRLINE_EXISTS', !!eastAirportsAirline);
          validator.check('WEST_AIRLINE_EXISTS', !!westAirportsAirline);
        });
      },
      {
        '*_EXISTS': 'Required.',
        '*_FORMAT_IS_VALID': 'Invalid format.',
        '*_IS_VALID': 'Invalid.',
        '*_IS_NOT_NEGATIVE': 'Should not be negative.'
      }
    );
  }
}

class NumberOfConnectionValidation extends Validation<
  | 'MAX_CONNECTION_TIME_EXISTS'
  | 'MAX_CONNECTION_TIME_IS_VALID'
  | 'MIN_CONNECTION_TIME_EXISTS'
  | 'MIN_CONNECTION_TIME_IS_VALID'
  | 'MIN_CONNECTION_IS_NOT_GREATER_THAN_MAX_CONNECTION_TIME'
  | 'MAX_CONNECTION_IS_NOT_LESS_THAN_MIN_CONNECTION_TIME',
  { connectionReportValidation: ConnectionReportValidation }
> {
  constructor(viewState: ViewState, reportDateRangeState: ReportDateRangeState) {
    const { maxConnectionTime, minConnectionTime } = viewState;
    super(
      validator => {
        validator.check('MAX_CONNECTION_TIME_EXISTS', !!maxConnectionTime).check('MAX_CONNECTION_TIME_IS_VALID', () => dataTypes.daytime.checkView(maxConnectionTime));
        validator.check('MIN_CONNECTION_TIME_EXISTS', !!minConnectionTime).check('MIN_CONNECTION_TIME_IS_VALID', () => dataTypes.daytime.checkView(minConnectionTime));
        validator.when('MAX_CONNECTION_TIME_EXISTS', 'MIN_CONNECTION_TIME_EXISTS').then(() => {
          const ok = dataTypes.daytime.convertViewToModel(minConnectionTime) <= dataTypes.daytime.convertViewToModel(maxConnectionTime);
          validator.check('MIN_CONNECTION_IS_NOT_GREATER_THAN_MAX_CONNECTION_TIME', ok, 'Can not be grater than max connection.');
          validator.check('MAX_CONNECTION_IS_NOT_LESS_THAN_MIN_CONNECTION_TIME', ok, 'Can not be less than max connection.');
        });
        validator.put(validator.$.connectionReportValidation, new ConnectionReportValidation(viewState, reportDateRangeState));
      },
      {
        '*_EXISTS': 'Required.',
        '*_FORMAT_IS_VALID': 'Invalid format.',
        '*_IS_VALID': 'Invalid.',
        '*_IS_NOT_NEGATIVE': 'Should not be negative.'
      }
    );
  }
}

interface ConnectionsReportProps {
  preplanName: string;
  fromDate: Date;
  toDate: Date;
}

interface FlightLegInfoModel {
  airport: Airport;
  flightInfo: FlightInfo[];
}

interface FlightInfo {
  weekday: number;
  departureTimeFromIKA: Date[];
  arrivalTimeToIKA: Date[];
}

interface AutoCompleteOption {
  label: string;
  value: string;
}

interface Airline extends AutoCompleteOption {}

const ConnectionsReport: FC<ConnectionsReportProps> = ({ preplanName, fromDate, toDate }) => {
  const preplan = useContext(PreplanContext);
  const { enqueueSnackbar } = useSnackbar();

  const [reportDateRange, setReportDateRange] = useState<ReportDateRangeState>({
    startDate: dataTypes.utcDate.convertBusinessToView(fromDate),
    endDate: dataTypes.utcDate.convertBusinessToView(toDate)
  });

  const [weekSelection, setWeekSelection] = useState<WeekSelection>({
    previousStartIndex: 0,
    startIndex: 0,
    endIndex: preplan.weeks.all.length,
    nextEndIndex: preplan.weeks.all.length
  });

  const flightViews = useMemo(() => {
    return preplan.getFlightViews(
      new Week(dataTypes.utcDate.convertViewToBusiness(reportDateRange.startDate)),
      new Week(dataTypes.utcDate.convertViewToBusiness(reportDateRange.endDate)),
      false
    );
  }, [reportDateRange]);

  const flightLegViews = flightViews.flatMap(f => f.legs);

  const allAirports = MasterData.all.airports.items;

  const allAirline = flightLegViews
    .map(f => f.flightNumber.airlineCode)
    .distinct()
    .map<Airline>(a => ({ label: a, value: a }));

  const defaultWestAirports = ['BCN', 'DXB', 'ESB', 'IST', 'VKO'];
  const defaultEestAirports = ['BKK', 'CAN', 'DEL', 'KUL', 'LHE', 'PEK', 'PVG'];
  const westAirports = persistant.rpaUserSetting?.ConnectionReport?.westAirports;
  const eastAirpots = persistant.rpaUserSetting?.ConnectionReport?.eastAirports;
  const [viewState, setViewState] = useState<ViewState>(() => ({
    westAirportsAirline: allAirline.find(z => z.value === 'W5') ?? allAirline[0],
    eastAirportsAirline: allAirline.find(z => z.value === 'W5') ?? allAirline[0],
    eastAirports: allAirports.filter(a => (!eastAirpots || eastAirpots.length === 0 ? defaultEestAirports : eastAirpots).indexOf(a.name) !== -1).orderBy('name'),
    westAirports: allAirports.filter(a => (!westAirports || westAirports.length === 0 ? defaultWestAirports : westAirports).indexOf(a.name) !== -1).orderBy('name'),
    startDate: dataTypes.utcDate.convertBusinessToView(fromDate),
    endDate: dataTypes.utcDate.convertBusinessToView(toDate),
    maxConnectionTime: dataTypes.daytime.convertModelToView(300),
    minConnectionTime: dataTypes.daytime.convertModelToView(70),
    autoCommit: false,
    commitMessage: ''
  }));

  const [connectionTableDataModel, setConnectionTableDataModel] = useState<{ [index: string]: any }[]>([]);
  const [connectionNumberDataModel, setConnectionNumberDataModel] = useState<{ [index: string]: any }[]>([]);
  const weekDay = Array.range(0, 6);

  let connectionNumberExporter: ExcelExport | null;
  let connectionTableExporter: ExcelExport | null;

  useEffect(() => {
    if (validation.ok) {
      const flightLegInfoModels: FlightLegInfoModel[] = [];

      const eastFlight = flightLegViews.filter(
        f =>
          f.rsx === 'REAL' &&
          f.flightNumber.airlineCode === viewState.eastAirportsAirline.value &&
          viewState.eastAirports.some(a => a.id === f.departureAirport.id || a.id === f.arrivalAirport.id)
      );

      const westFlight = flightLegViews.filter(
        f =>
          f.rsx === 'REAL' &&
          f.flightNumber.airlineCode === viewState.westAirportsAirline.value &&
          viewState.westAirports.some(a => a.id === f.departureAirport.id || a.id === f.arrivalAirport.id)
      );

      const targetFlights = eastFlight.concat(westFlight);

      viewState.eastAirports.forEach(airport => {
        if (!flightLegInfoModels.some(f => f.airport === airport)) {
          flightLegInfoModels.push({ airport: airport, flightInfo: [] });
        }
      });

      viewState.westAirports.forEach(airport => {
        if (!flightLegInfoModels.some(f => f.airport === airport)) {
          flightLegInfoModels.push({ airport: airport, flightInfo: [] });
        }
      });

      targetFlights.forEach(flight => {
        const isDepartureFromIKA = flight.departureAirport.name === 'IKA';
        const isArrivalToIKA = flight.arrivalAirport.name === 'IKA';

        const baseDate = dataTypes.utcDate.convertViewToBusiness(reportDateRange.startDate);
        if (isDepartureFromIKA) {
          const utcStd = flight.actualStd.toDate(baseDate);
          const localStd = flight.departureAirport.convertUtcToLocal(utcStd);

          let diffLocalStdandUtcStd = localStd.getUTCDay() - utcStd.getUTCDay();
          if (diffLocalStdandUtcStd > 1) diffLocalStdandUtcStd = -1;
          if (diffLocalStdandUtcStd < -1) diffLocalStdandUtcStd = 1;

          const departureWeekDay = (flight.actualDepartureDay + Math.floor(flight.actualStd.minutes / 1440) + diffLocalStdandUtcStd + 7) % 7;

          const flightLegInfoModel = flightLegInfoModels.find(f => f.airport.id === flight.arrivalAirport.id);
          if (flightLegInfoModel) {
            const flightInfo = flightLegInfoModel.flightInfo.find(fi => fi.weekday === departureWeekDay);
            if (flightInfo) {
              flightInfo.departureTimeFromIKA.push(localStd);
            } else {
              flightLegInfoModel.flightInfo.push({
                weekday: departureWeekDay,
                arrivalTimeToIKA: [],
                departureTimeFromIKA: [localStd]
              });
            }
          }
        } else if (isArrivalToIKA) {
          const utcStd = flight.actualStd.toDate(baseDate);
          const localStd = flight.departureAirport.convertUtcToLocal(utcStd);
          const utcSta = flight.actualSta.toDate(baseDate);
          const localSta = flight.arrivalAirport.convertUtcToLocal(utcSta);

          let diffLocalStdandUtcStd = localStd.getUTCDay() - utcStd.getUTCDay();
          if (diffLocalStdandUtcStd > 1) diffLocalStdandUtcStd = -1;
          if (diffLocalStdandUtcStd < -1) diffLocalStdandUtcStd = 1;

          let diffLocalStdandLocalSta = localStd.getUTCDay() - localSta.getUTCDay();
          if (diffLocalStdandLocalSta > 1) diffLocalStdandLocalSta = -1;
          if (diffLocalStdandLocalSta < -1) diffLocalStdandLocalSta = 1;

          const arrivalWeekDay =
            (flight.actualDepartureDay + Math.floor(flight.actualStd.minutes / 1440) + diffLocalStdandUtcStd + (diffLocalStdandLocalSta === -1 ? 1 : 0) + 7) % 7;

          const flightLegInfoModel = flightLegInfoModels.find(f => f.airport.id === flight.departureAirport.id);
          if (flightLegInfoModel) {
            const flightInfo = flightLegInfoModel.flightInfo.find(fi => fi.weekday === arrivalWeekDay);
            if (flightInfo) {
              flightInfo.arrivalTimeToIKA.push(localSta);
            } else {
              flightLegInfoModel.flightInfo.push({
                weekday: arrivalWeekDay,
                arrivalTimeToIKA: [localSta],
                departureTimeFromIKA: []
              });
            }
          }
        }
      });

      setConnectionTableDataModel(generateConnectionTableDataModel(flightLegInfoModels));
      if (numberOfConnectionValidation.ok) {
        setConnectionNumberDataModel(generateConnectionNumberDataModel(flightLegInfoModels));
      }
    }
  }, [viewState]);

  const validation = new ConnectionReportValidation(viewState, reportDateRange);
  const numberOfConnectionValidation = new NumberOfConnectionValidation(viewState, reportDateRange);

  const errors = {
    eastAirports: validation.message('EAST_AIRPORT_*'),
    westAirports: validation.message('WEST_AIRPORT_*'),
    startDate: validation.message('START_DATE_*'),
    endDate: validation.message('END_DATE_*'),
    eastAirline: validation.message('EAST_AIRLINE_*'),
    westAirline: validation.message('WEST_AIRLINE_*'),
    maxConnectionTime: numberOfConnectionValidation.message('MAX_CONNECTION_*'),
    minConnectionTime: numberOfConnectionValidation.message('MIN_CONNECTION_*')
  };

  const classes = useStyles();

  const formatUTCDateToLocal = (localDate: Date): string => {
    if (!localDate) return '';

    return (
      localDate
        .getUTCHours()
        .toString()
        .padStart(2, '0') +
      localDate
        .getUTCMinutes()
        .toString()
        .padStart(2, '0')
    );
  };

  const compareFunction = (a: number, b: number): number => {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  };

  const generateConnectionNumberDataModel = (flightLegInfoModels: FlightLegInfoModel[]): { [index: number]: string | number }[] => {
    const result: { [index: number]: string | number }[] = [];
    if (viewState.eastAirports && viewState.westAirports) {
      viewState.eastAirports.forEach(ea => {
        const connection: any = {};
        connection['airport'] = ea.name;

        viewState.westAirports.forEach(wa => {
          connection['to' + wa.name] =
            getNumberOfConnection(flightLegInfoModels.find(f => f.airport.id === ea.id)!, flightLegInfoModels.find(f => f.airport.id === wa.id)!) || character.zeroConnection;
          connection['from' + wa.name] =
            getNumberOfConnection(flightLegInfoModels.find(f => f.airport.id === wa.id)!, flightLegInfoModels.find(f => f.airport.id === ea.id)!) || character.zeroConnection;
        });
        result.push(connection);
      });
    }
    return result;
  };

  const generateConnectionTableDataModel = (flightLegInfoModels: FlightLegInfoModel[]): { [index: number]: string | number }[] => {
    const result: { [index: string]: any }[] = [];

    if (viewState.eastAirports && viewState.westAirports) {
      weekDay.forEach(w => {
        const model: any = {};
        model['day'] = Weekday[w].toUpperCase().substring(0, 3);

        viewState.eastAirports.forEach(airport => {
          model['from' + airport.name] = model['to' + airport.name] = '';
          const flightLegInfoModel = flightLegInfoModels.find(f => f.airport.id === airport.id);
          if (flightLegInfoModel) {
            const flightInfo = flightLegInfoModel.flightInfo.find(fi => fi.weekday === w);
            if (flightInfo) {
              model['from' + airport.name] = flightInfo.arrivalTimeToIKA
                .sort((a, b) => compareFunction(a.getTime(), b.getTime()))
                .map(a => formatUTCDateToLocal(a))
                .join('\r\n');
              model['to' + airport.name] = flightInfo.departureTimeFromIKA
                .sort((a, b) => compareFunction(a.getTime(), b.getTime()))
                .map(a => formatUTCDateToLocal(a))
                .join('\r\n');
            }
          }
        });

        viewState.westAirports.forEach(airport => {
          model[airport.name] = '';
          const flightLegInfoModel = flightLegInfoModels.find(f => f.airport.id === airport.id);

          if (flightLegInfoModel) {
            const flightInfo = flightLegInfoModel.flightInfo.find(fi => fi.weekday === w);
            if (flightInfo) {
              const stas = flightInfo.arrivalTimeToIKA.sort((a, b) => compareFunction(a.getTime(), b.getTime()));
              const stds = flightInfo.departureTimeFromIKA.sort((a, b) => compareFunction(a.getTime(), b.getTime()));
              if (stas.length <= 0 && stds.length <= 0) return;

              model[airport.name] = Array.range(0, Math.max(stas.length, stds.length) - 1)
                .map(i => {
                  return formatUTCDateToLocal(stds[i]) + '–' + formatUTCDateToLocal(stas[i]);
                })
                .join('\r\n');
            }
          }
        });

        result.push(model);
      });
    }

    return result;
  };

  /**
   *
   * @param fromFlightLegInfoModel
   * @param toFlightLegInfoModel
   * @param direction
   * @param connectionModel
   */
  const getNumberOfConnection = (fromFlightLegInfoModel: FlightLegInfoModel, toFlightLegInfoModel: FlightLegInfoModel): number => {
    let result: number = 0;

    weekDay.forEach(w => {
      const fromFlightInfo = fromFlightLegInfoModel.flightInfo.find(f => f.weekday === w);
      const toFlightInfo = toFlightLegInfoModel.flightInfo.find(f => f.weekday === w);
      if (!fromFlightInfo || !toFlightInfo) return;

      if (
        fromFlightInfo.arrivalTimeToIKA.some(staToIka => {
          return toFlightInfo.departureTimeFromIKA.some(stdFromIka => {
            const diff = (stdFromIka.getUTCHours() - staToIka.getUTCHours()) * 60 + (stdFromIka.getUTCMinutes() - staToIka.getUTCMinutes());
            return diff <= converteHHMMtoTotalMinute(viewState.maxConnectionTime) && diff >= converteHHMMtoTotalMinute(viewState.minConnectionTime);
          });
        })
      ) {
        result++;
      }
    });

    return result;
  };

  const detailCellOption = {
    textAlign: 'center',
    verticalAlign: 'center',
    borderBottom: { color: '#BDBDBD', size: 1 },
    borderLeft: { color: '#BDBDBD', size: 1 },
    borderRight: { color: '#BDBDBD', size: 1 },
    borderTop: { color: '#BDBDBD', size: 1 },
    fontSize: 9
  } as CellOptions;

  const headerCellOptions = {
    textAlign: 'center',
    verticalAlign: 'center',
    borderBottom: { color: '#BDBDBD', size: 1 },
    borderLeft: { color: '#BDBDBD', size: 1 },
    borderRight: { color: '#BDBDBD', size: 1 },
    borderTop: { color: '#BDBDBD', size: 1 },
    fontSize: 12,
    color: '#000000',
    bold: true
  } as CellOptions;

  const columnGroupCellOptions = {
    textAlign: 'center',
    verticalAlign: 'center',
    borderBottom: { color: '#BDBDBD', size: 1 },
    borderLeft: { color: '#BDBDBD', size: 1 },
    borderRight: { color: '#BDBDBD', size: 1 },
    borderTop: { color: '#BDBDBD', size: 1 },
    fontSize: 12,
    color: '#000000',
    bold: true,
    background: '#F4B084'
  } as CellOptions;

  const numberOfConnectionExcelStyle = {
    headerCellOption: { ...headerCellOptions, background: '#C6EFCE' }
  };

  const generateWestAirport = viewState.westAirports.map(airport => (
    <ExcelExportColumn
      key={airport.id}
      field={airport.name}
      title={airport.name}
      width={54}
      cellOptions={{
        ...detailCellOption,
        wrap: true,
        background: '#FBE0CE'
      }}
      headerCellOptions={{
        ...headerCellOptions,
        background: '#F4B084'
      }}
    />
  ));

  const generateFromEastAirport = viewState.eastAirports.map(airport => (
    <ExcelExportColumn
      key={airport.id}
      field={'from' + airport.name}
      title={airport.name}
      width={30}
      cellOptions={{ ...detailCellOption, wrap: true }}
      headerCellOptions={{
        ...headerCellOptions,
        background: '#F4B084'
      }}
    />
  ));

  const generateToEastAirport = viewState.eastAirports.map(airport => (
    <ExcelExportColumn
      key={airport.id}
      field={'to' + airport.name}
      title={airport.name}
      width={30}
      cellOptions={{ ...detailCellOption, wrap: true }}
      headerCellOptions={{
        ...headerCellOptions,
        background: '#F4B084'
      }}
    />
  ));

  const exportConnectionTable = (
    <Fragment>
      <Button
        variant="outlined"
        color="primary"
        onClick={async () => {
          if (connectionTableExporter) {
            const options = connectionTableExporter.workbookOptions();
            const rows = options && options.sheets && options.sheets[0] && options.sheets[0].rows;
            if (rows) {
              rows.forEach(r => {
                if (r.cells) {
                  const numberOfNewLive = r.cells.map(c => (typeof c.value === 'string' ? c.value.split('\r\n').length : 0)).sort(compareFunction);
                  r.height = 15 * numberOfNewLive[numberOfNewLive.length - 1] + 5;
                }
              });
            }

            connectionTableExporter.save(options);

            if (viewState.autoCommit) {
              try {
                await PreplanService.commit(preplan.versions.find(v => v.current)!.id, viewState.commitMessage);
              } catch (error) {
                enqueueSnackbar(String(error), { variant: 'error' });
              }
            }
          }
        }}
        disabled={!validation.ok}
      >
        Export to Excel
        <ExportToExcelIcon className={classes.transform180} />
      </Button>

      <ExcelExport
        data={connectionTableDataModel}
        fileName={preplanName + ' ConnectionTable.xlsx'}
        ref={exporter => {
          connectionTableExporter = exporter;
        }}
      >
        <ExcelExportColumn
          title={' '}
          field="day"
          width={30}
          cellOptions={{ ...headerCellOptions, background: '#F4B084' }}
          headerCellOptions={{ ...headerCellOptions, background: '#F4B084' }}
        />

        <ExcelExportColumnGroup title="Arrival to IKA" headerCellOptions={columnGroupCellOptions}>
          <ExcelExportColumnGroup title={viewState.eastAirportsAirline.label} headerCellOptions={columnGroupCellOptions}>
            {generateFromEastAirport}
          </ExcelExportColumnGroup>
        </ExcelExportColumnGroup>
        <ExcelExportColumnGroup title={preplanName + ' CONNECTIONS'} headerCellOptions={columnGroupCellOptions}>
          <ExcelExportColumnGroup title={viewState.westAirportsAirline.label} headerCellOptions={columnGroupCellOptions}>
            {generateWestAirport}
          </ExcelExportColumnGroup>
        </ExcelExportColumnGroup>
        <ExcelExportColumnGroup title="Departure from IKA" headerCellOptions={columnGroupCellOptions}>
          <ExcelExportColumnGroup title={viewState.eastAirportsAirline.label} headerCellOptions={columnGroupCellOptions}>
            {generateToEastAirport}
          </ExcelExportColumnGroup>
        </ExcelExportColumnGroup>
      </ExcelExport>
    </Fragment>
  );

  const connectionTable = (
    <Table>
      <TableHead>
        <TableRow className={classes.header}>
          <TableCell className={classes.boarder} />
          <TableCell colSpan={viewState.eastAirports.length} align="center" className={classes.boarder}>
            Arrival to IKA
          </TableCell>
          <TableCell colSpan={viewState.westAirports.length} className={classes.boarder} />

          <TableCell colSpan={viewState.eastAirports.length} align="center" className={classes.boarder}>
            Departure from IKA
          </TableCell>
        </TableRow>
        <TableRow className={classes.header}>
          <TableCell className={classes.boarder} />
          <TableCell colSpan={viewState.eastAirports.length} align="center" className={classes.boarder}>
            {viewState.eastAirportsAirline.label}
          </TableCell>
          <TableCell colSpan={viewState.westAirports.length} align="center" className={classes.boarder}>
            {viewState.westAirportsAirline.label}
          </TableCell>

          <TableCell colSpan={viewState.eastAirports.length} align="center" className={classes.boarder}>
            {viewState.eastAirportsAirline.label}
          </TableCell>
        </TableRow>
        <TableRow className={classes.airportHeader}>
          <TableCell className={classNames(classes.header, classes.boarder)} />
          {viewState.eastAirports.map(airport => (
            <TableCell key={airport.id} className={classes.boarder}>
              {airport.name}
            </TableCell>
          ))}
          {viewState.westAirports.map(airport => (
            <TableCell key={airport.id} className={classNames(classes.boarder)}>
              {airport.name}
            </TableCell>
          ))}
          {viewState.eastAirports.map(airport => (
            <TableCell key={airport.id} className={classes.boarder}>
              {airport.name}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {connectionTableDataModel.map((ct, index) => (
          <TableRow key={index}>
            <TableCell className={classNames(classes.header, classes.boarder)}>{ct['day']}</TableCell>
            {viewState.eastAirports.map(a => (
              <TableCell key={'from' + a.name} className={classes.boarder}>
                <Fragment>{ct['from' + a.name] && ct['from' + a.name].split('\r\n').map((n: any) => <div>{n}</div>)}</Fragment>
              </TableCell>
            ))}
            {viewState.westAirports.map(a => (
              <TableCell className={classNames(classes.west, classes.boarder)} key={a.name}>
                <Fragment>
                  {ct[a.name] &&
                    ct[a.name].split('\r\n').map((n: any) => (
                      <div>
                        {n.split('–')[0]}–{n.split('–')[1]}
                      </div>
                    ))}
                </Fragment>
              </TableCell>
            ))}
            {viewState.eastAirports.map(a => (
              <TableCell key={'to' + a.name} className={classes.boarder}>
                <Fragment>{ct['to' + a.name] && ct['to' + a.name].split('\r\n').map((n: any) => <div>{n}</div>)}</Fragment>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const exportConnectionNumber = (
    <Fragment>
      <Button
        variant="outlined"
        color="primary"
        onClick={async () => {
          if (connectionNumberExporter) {
            const options = connectionNumberExporter.workbookOptions();
            const rows = options && options.sheets && options.sheets[0] && options.sheets[0].rows;

            if (rows) {
              rows.forEach(r => {
                const row = r as any;
                if (row.type === 'data') {
                  r.cells!.forEach(c => {
                    if (c.value === character.zeroConnection) c.color = '#C4BD97';
                  });
                }
              });

              const lastRowCells = rows.last()!.cells!;
              for (let index = 1; index < lastRowCells.length; index++) {
                const cell = lastRowCells[index];
                cell.borderBottom = { color: '#000000', size: 2 };
              }
            }
            connectionNumberExporter.save(options);

            if (viewState.autoCommit) {
              try {
                await PreplanService.commit(preplan.versions.find(v => v.current)!.id, viewState.commitMessage);
              } catch (error) {
                enqueueSnackbar(String(error), { variant: 'error' });
              }
            }
          }
        }}
        disabled={!numberOfConnectionValidation.ok}
      >
        Export to Excel
        <ExportToExcelIcon className={classes.transform180} />
      </Button>

      <ExcelExport
        data={connectionNumberDataModel}
        fileName={preplanName + ' NumberOfConnection.xlsx'}
        ref={exporter => {
          connectionNumberExporter = exporter;
        }}
      >
        <ExcelExportColumn
          field="airport"
          locked={false}
          title={viewState.eastAirportsAirline.label}
          width={50}
          cellOptions={numberOfConnectionExcelStyle.headerCellOption}
          headerCellOptions={{ ...numberOfConnectionExcelStyle.headerCellOption, verticalAlign: 'bottom' }}
        />

        <ExcelExportColumnGroup
          title={preplanName + ' Number of Connection (Minimum Connection Time: ' + viewState.minConnectionTime + ' Maximum Connection Time: ' + viewState.maxConnectionTime + ')'}
          headerCellOptions={numberOfConnectionExcelStyle.headerCellOption}
        >
          <ExcelExportColumnGroup title={viewState.westAirportsAirline.label} headerCellOptions={numberOfConnectionExcelStyle.headerCellOption}>
            {viewState.westAirports.map(wa => (
              <ExcelExportColumnGroup
                title={wa.name}
                key={wa.id}
                headerCellOptions={{
                  ...numberOfConnectionExcelStyle.headerCellOption,
                  borderLeft: { size: 2, color: '#000000' },
                  borderRight: { size: 2, color: '#000000' },
                  borderTop: { size: 2, color: '#000000' }
                }}
              >
                <ExcelExportColumn
                  field={'to' + wa.name}
                  title={'↗'}
                  locked={false}
                  width={50}
                  cellOptions={{
                    ...detailCellOption,
                    wrap: true,
                    fontSize: 12,
                    borderLeft: { size: 2, color: '#000000' }
                  }}
                  headerCellOptions={{
                    ...numberOfConnectionExcelStyle.headerCellOption,
                    borderLeft: { size: 2, color: '#000000' }
                  }}
                />
                <ExcelExportColumn
                  field={'from' + wa.name}
                  title={'↘'}
                  locked={false}
                  width={50}
                  cellOptions={{
                    ...detailCellOption,
                    wrap: true,
                    fontSize: 12,
                    borderRight: { size: 2, color: '#000000' }
                  }}
                  headerCellOptions={{
                    ...numberOfConnectionExcelStyle.headerCellOption,
                    borderRight: { size: 2, color: '#000000' }
                  }}
                />
              </ExcelExportColumnGroup>
            ))}
          </ExcelExportColumnGroup>
        </ExcelExportColumnGroup>
      </ExcelExport>
    </Fragment>
  );

  const connectionNumber = (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell className={classNames(classes.connectionHeader, classes.boarder)} />
          <TableCell colSpan={viewState.westAirports.length * 2} align="center" className={classNames(classes.connectionHeader, classes.boarder)}>
            {viewState.westAirportsAirline.label}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="center" className={classNames(classes.connectionHeader, classes.boarder)}>
            <div className={classes.connectionEastAirline}>{viewState.eastAirportsAirline.label}</div>
          </TableCell>
          {viewState.westAirports.map(wa => (
            <TableCell className={classNames(classes.connectionHeader, classes.boarder)} key={wa.id} colSpan={2} align="center">
              <ConnectionIcon className={classes.connectionFrom} />
              {wa.name}
              <ConnectionIcon className={classes.connectionTo} />
            </TableCell>
          ))}
        </TableRow>
        {connectionNumberDataModel.map(cn => (
          <TableRow key={cn['airport']}>
            <TableCell className={classNames(classes.connectionHeader, classes.boarder)} align="center">
              {cn['airport']}
            </TableCell>
            {viewState.westAirports.map(wa => (
              <Fragment key={wa.id}>
                <TableCell
                  className={classNames(classes.boarder, classes.removeRightBoarder, cn['to' + wa.name] === character.zeroConnection ? classes.zeroNumberOfConnection : '')}
                  align="center"
                >
                  {cn['to' + wa.name]}
                </TableCell>
                <TableCell
                  className={classNames(classes.boarder, classes.removeLeftBoarder, cn['from' + wa.name] === character.zeroConnection ? classes.zeroNumberOfConnection : '')}
                  align="center"
                >
                  {cn['from' + wa.name]}
                </TableCell>
              </Fragment>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Fragment>
      <Box display="block" displayPrint="none">
        <div className={classes.selectWeekWrapper}>
          <SelectWeeks
            includeSides={false}
            weekSelection={weekSelection}
            onSelectWeeks={weekSelection => {
              setWeekSelection(weekSelection);
              const weekStart = preplan.weeks.all[weekSelection.startIndex];
              const weekEnd = preplan.weeks.all[weekSelection.endIndex - 1];
              setReportDateRange({
                startDate: dataTypes.utcDate.convertBusinessToView(weekStart.startDate < fromDate ? fromDate : weekStart.startDate),
                endDate: dataTypes.utcDate.convertBusinessToView(weekEnd.endDate > toDate ? toDate : weekEnd.endDate)
              });
            }}
          />
        </div>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            East Flight
          </Grid>
          <Grid item xs={1}>
            <AutoComplete
              id="airline"
              options={allAirline}
              value={viewState.eastAirportsAirline}
              onSelect={eastAirportsAirline => {
                setViewState({ ...viewState, eastAirportsAirline });
              }}
              error={errors.eastAirline !== undefined}
              helperText={errors.eastAirline}
            />
          </Grid>
          <Grid item xs={11}>
            <MultiSelect
              id="east-airport"
              value={viewState.eastAirports}
              options={allAirports}
              getOptionLabel={r => r.name}
              getOptionValue={r => r.id}
              onSelect={value => {
                setViewState({ ...viewState, eastAirports: value ? value.orderBy('name') : [] });
              }}
              className={classes.marginBottom1}
              error={errors.eastAirports !== undefined}
              helperText={errors.eastAirports}
            />
          </Grid>
          <Grid item xs={12}>
            West Flight
          </Grid>
          <Grid item xs={1}>
            <AutoComplete
              id="airline"
              options={allAirline}
              value={viewState.westAirportsAirline}
              onSelect={westAirportsAirline => {
                setViewState({ ...viewState, westAirportsAirline });
              }}
              error={errors.westAirline !== undefined}
              helperText={errors.westAirline}
            />
          </Grid>
          <Grid item xs={11}>
            <MultiSelect
              id="west-airport"
              value={viewState.westAirports}
              options={allAirports}
              getOptionLabel={r => r.name}
              getOptionValue={r => r.id}
              onSelect={value => {
                setViewState({ ...viewState, westAirports: value ? value.orderBy('name') : [] });
              }}
              error={errors.westAirports !== undefined}
              helperText={errors.westAirports}
            />
          </Grid>
        </Grid>
        <br />
        <RefiningTextField
          label="Start Date"
          dataType={dataTypes.utcDate}
          value={reportDateRange.startDate}
          onChange={({ target: { value: startDate } }) => setReportDateRange({ ...reportDateRange, startDate })}
          error={errors.startDate !== undefined}
          helperText={errors.startDate}
          disabled
        />

        <RefiningTextField
          label="End Date"
          dataType={dataTypes.utcDate}
          value={reportDateRange.endDate}
          onChange={({ target: { value: endDate } }) => setReportDateRange({ ...reportDateRange, endDate })}
          error={errors.endDate !== undefined}
          helperText={errors.endDate}
          disabled
        />

        <FormControlLabel
          control={<Checkbox checked={viewState.autoCommit} onChange={({ target: { checked: autoCommit } }) => setViewState({ ...viewState, autoCommit })} color="primary" />}
          label={
            <TextField
              label="Auto-commit message"
              onChange={({ target: { value: commitMessage } }) => setViewState({ ...viewState, commitMessage })}
              disabled={!viewState.autoCommit}
            ></TextField>
          }
          labelPlacement="end"
          disabled={preplan.readonly}
        />

        <br />
        <br />

        {<div className={classNames(classes.export, classes.marginBottom1)}>{exportConnectionTable}</div>}
      </Box>
      {validation.ok ? (
        <div className={classes.tableContainer}>{connectionTable}</div>
      ) : (
        <Paper className={classes.errorPaper}>
          <Typography align="center" className={classes.errorPaperMessage}>
            Invalid form fields.
          </Typography>
        </Paper>
      )}

      <br />
      <br />

      <Box display="block" displayPrint="none">
        <RefiningTextField
          label="Minimum Connection Time"
          dataType={dataTypes.daytime}
          value={viewState.minConnectionTime}
          onChange={({ target: { value: minConnectionTime } }) => setViewState({ ...viewState, minConnectionTime })}
          error={errors.minConnectionTime !== undefined}
          helperText={errors.minConnectionTime}
        />

        <RefiningTextField
          label="Maximum Connection Time"
          dataType={dataTypes.daytime}
          value={viewState.maxConnectionTime}
          onChange={({ target: { value: maxConnectionTime } }) => setViewState({ ...viewState, maxConnectionTime })}
          error={errors.maxConnectionTime !== undefined}
          helperText={errors.maxConnectionTime}
        />

        <br />
        <br />

        {<div className={classNames(classes.export, classes.marginBottom1)}>{exportConnectionNumber}</div>}
      </Box>
      {numberOfConnectionValidation.ok ? (
        <div className={classes.tableContainer}>{connectionNumber}</div>
      ) : (
        <Paper className={classes.errorPaper}>
          <Typography align="center" className={classes.errorPaperMessage}>
            Invalid form fields.
          </Typography>
        </Paper>
      )}
    </Fragment>
  );
};

export default ConnectionsReport;

function converteHHMMtoTotalMinute(HHMM: string): number {
  const hour = +HHMM.substr(0, 2);
  const minutes = +HHMM.substr(2, 2);
  return hour * 60 + minutes;
}
