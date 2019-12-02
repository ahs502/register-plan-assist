import React, { FC, useState, Fragment, useEffect } from 'react';
import { Theme, InputLabel, TextField, TableHead, TableCell, Table, TableRow, TableBody, Button, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MasterData, { Airport } from '@core/master-data';
import Weekday from '@core/types/Weekday';
import MultiSelect from 'src/components/MultiSelect';
import classNames from 'classnames';
import { CallMade as ConnectionIcon, Publish as ExportToExcelIcon } from '@material-ui/icons';
import { ExcelExport, ExcelExportColumn, ExcelExportColumnGroup } from '@progress/kendo-react-excel-export';
import { CellOptions } from '@progress/kendo-react-excel-export/dist/npm/ooxml/CellOptionsInterface';
import FlightLeg from 'src/business/flight/FlightLeg';
import { dataTypes } from 'src/utils/DataType';
import RefiningTextField from 'src/components/RefiningTextField';
import Validation from '@core/node_modules/@ahs502/validation/dist/Validation';

const errorPaperSize = 250;
const character = {
  zeroConnection: '–'
};

const useStyles = makeStyles((theme: Theme) => ({
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
  eastAirports: Airport[];
  westAirports: Airport[];
  startDate: string;
  endDate: string;
  baseDate: string;
  maxConnectionTime: string;
  minConnectionTime: string;
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
> {
  constructor(startDate: string, endDate: string, baseDate: string, eastAirports: Airport[], westAirports: Airport[]) {
    super(
      validator => {
        validator.check('EAST_AIRPORT_EXISTS', eastAirports.length > 0);
        validator.check('WEST_AIRPORT_EXISTS', westAirports.length > 0);
        validator.check('START_DATE_EXISTS', !!startDate).check('START_DATE_IS_VALID', () => dataTypes.utcDate.checkView(startDate));
        validator.check('END_DATE_EXISTS', !!endDate).check('END_DATE_IS_VALID', () => dataTypes.utcDate.checkView(endDate));
        validator.check('BASE_DATE_EXISTS', !!baseDate).check('BASE_DATE_IS_VALID', () => dataTypes.utcDate.checkView(baseDate));
        validator.when('START_DATE_IS_VALID', 'END_DATE_IS_VALID').then(() => {
          const ok = dataTypes.utcDate.convertViewToModel(startDate) <= dataTypes.utcDate.convertViewToModel(endDate);
          validator.check('START_DATE_IS_NOT_AFTER_END_DATE', ok, 'Can not be after end date.');
          validator.check('END_DATE_IS_NOT_BEFORE_START_DATE', ok, 'Can not be before start date.');
          validator
            .when('START_DATE_IS_NOT_AFTER_END_DATE', 'END_DATE_IS_NOT_BEFORE_START_DATE', 'BASE_DATE_IS_VALID')
            .check(
              'BASE_DATE_BETWEEN_START_DATE_AND_END_DATE',
              () =>
                dataTypes.utcDate.convertViewToModel(baseDate) <= dataTypes.utcDate.convertViewToModel(endDate) &&
                dataTypes.utcDate.convertViewToModel(startDate) <= dataTypes.utcDate.convertViewToModel(baseDate),
              'Between start date and end date.'
            );
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
  constructor(maxConnectionTime: string, minConnectionTime: string, startDate: string, endDate: string, baseDate: string, eastAirports: Airport[], westAirports: Airport[]) {
    super(
      validator => {
        validator.check('MAX_CONNECTION_TIME_EXISTS', !!maxConnectionTime).check('MAX_CONNECTION_TIME_IS_VALID', () => dataTypes.daytime.checkView(maxConnectionTime));
        validator.check('MIN_CONNECTION_TIME_EXISTS', !!minConnectionTime).check('MIN_CONNECTION_TIME_IS_VALID', () => dataTypes.daytime.checkView(minConnectionTime));
        validator.when('MAX_CONNECTION_TIME_EXISTS', 'MIN_CONNECTION_TIME_EXISTS').then(() => {
          const ok = dataTypes.daytime.convertViewToModel(minConnectionTime) <= dataTypes.daytime.convertViewToModel(maxConnectionTime);
          validator.check('MIN_CONNECTION_IS_NOT_GREATER_THAN_MAX_CONNECTION_TIME', ok, 'Can not be grater than max connection.');
          validator.check('MAX_CONNECTION_IS_NOT_LESS_THAN_MIN_CONNECTION_TIME', ok, 'Can not be less than max connection.');
        });
        validator.put(validator.$.connectionReportValidation, new ConnectionReportValidation(startDate, endDate, baseDate, eastAirports, westAirports));
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
  flights: readonly FlightLeg[];
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

const ConnectionsReport: FC<ConnectionsReportProps> = ({ flights, preplanName, fromDate, toDate }) => {
  const allAirports = MasterData.all.airports.items;
  const defaultWestAirport = ['BCN', 'DXB', 'ESB', 'EVN', 'GYD', 'IST', 'MXP', 'VKO'];
  const defaultEastAirpot = ['BKK', 'CAN', 'DEL', 'BOM', 'KUL', 'LHE', 'PEK', 'PVG'];
  const [{ eastAirports, westAirports, startDate, endDate, baseDate, maxConnectionTime, minConnectionTime }, setViewState] = useState<ViewState>(() => ({
    eastAirports: allAirports.filter(a => defaultEastAirpot.indexOf(a.name) !== -1).orderBy('name'),
    westAirports: allAirports.filter(a => defaultWestAirport.indexOf(a.name) !== -1).orderBy('name'),
    startDate: dataTypes.utcDate.convertBusinessToView(fromDate),
    endDate: dataTypes.utcDate.convertBusinessToView(toDate),
    baseDate: dataTypes.utcDate.convertBusinessToView(fromDate),
    maxConnectionTime: dataTypes.daytime.convertModelToView(300),
    minConnectionTime: dataTypes.daytime.convertModelToView(70)
  }));

  const [connectionTableDataModel, setConnectionTableDataModel] = useState<{ [index: string]: any }[]>([]);
  const [connectionNumberDataModel, setConnectionNumberDataModel] = useState<{ [index: string]: any }[]>([]);
  const weekDay = Array.range(0, 6);

  let connectionNumberExporter: ExcelExport | null;
  let connectionTableExporter: ExcelExport | null;

  useEffect(() => {
    if (validation.ok) {
      const flightLegInfoModels: FlightLegInfoModel[] = [];
      const reportBaseDate = new Date(dataTypes.utcDate.convertViewToModel(baseDate));

      const targetFlights = flights.filter(
        f =>
          eastAirports.some(a => a.id === f.departureAirport.id || a.id === f.arrivalAirport.id) ||
          westAirports.some(a => a.id === f.departureAirport.id || a.id === f.arrivalAirport.id)
      );

      eastAirports.forEach(airport => {
        if (!flightLegInfoModels.some(f => f.airport === airport)) {
          flightLegInfoModels.push({ airport: airport, flightInfo: [] });
        }
      });

      westAirports.forEach(airport => {
        if (!flightLegInfoModels.some(f => f.airport === airport)) {
          flightLegInfoModels.push({ airport: airport, flightInfo: [] });
        }
      });

      targetFlights.forEach(flight => {
        const isDepartureFromIKA = flight.departureAirport.name === 'IKA';
        if (isDepartureFromIKA) {
          const utcStd = flight.actualStd.toDate(reportBaseDate);
          const localStd = flight.departureAirport.convertUtcToLocal(utcStd);

          let diffLocalStdandUtcStd = localStd.getUTCDay() - utcStd.getUTCDay();
          if (diffLocalStdandUtcStd > 1) diffLocalStdandUtcStd = -1;
          if (diffLocalStdandUtcStd < -1) diffLocalStdandUtcStd = 1;

          const departureWeekDay = (flight.day + Math.floor(flight.actualStd.minutes / 1440) + diffLocalStdandUtcStd + 7) % 7;

          const flightLegInfoModel = flightLegInfoModels.find(f => f.airport.id === flight.arrivalAirport.id);
          if (flightLegInfoModel) {
            const flightInfo = flightLegInfoModel.flightInfo.find(fi => fi.weekday === departureWeekDay);
            if (flightInfo) {
              flightInfo.departureTimeFromIKA.push(localStd);
            } else {
              flightLegInfoModel.flightInfo.push({ weekday: departureWeekDay, arrivalTimeToIKA: [], departureTimeFromIKA: [localStd] });
            }
          }
        } else {
          const utcStd = flight.actualStd.toDate(reportBaseDate);
          const localStd = flight.departureAirport.convertUtcToLocal(utcStd);
          const utcSta = flight.actualSta.toDate(reportBaseDate);
          const localSta = flight.arrivalAirport.convertUtcToLocal(utcSta);

          let diffLocalStdandUtcStd = localStd.getUTCDay() - utcStd.getUTCDay();
          if (diffLocalStdandUtcStd > 1) diffLocalStdandUtcStd = -1;
          if (diffLocalStdandUtcStd < -1) diffLocalStdandUtcStd = 1;

          let diffLocalStdandLocalSta = localStd.getUTCDay() - localSta.getUTCDay();
          if (diffLocalStdandLocalSta > 1) diffLocalStdandLocalSta = -1;
          if (diffLocalStdandLocalSta < -1) diffLocalStdandLocalSta = 1;

          const arrivalWeekDay = (flight.day + Math.floor(flight.actualStd.minutes / 1440) + diffLocalStdandUtcStd + (diffLocalStdandLocalSta === -1 ? 1 : 0) + 7) % 7;

          const flightLegInfoModel = flightLegInfoModels.find(f => f.airport.id === flight.departureAirport.id);
          if (flightLegInfoModel) {
            const flightInfo = flightLegInfoModel.flightInfo.find(fi => fi.weekday === arrivalWeekDay);
            if (flightInfo) {
              flightInfo.arrivalTimeToIKA.push(localSta);
            } else {
              flightLegInfoModel.flightInfo.push({ weekday: arrivalWeekDay, arrivalTimeToIKA: [localSta], departureTimeFromIKA: [] });
            }
          }
        }
      });

      setConnectionTableDataModel(generateConnectionTableDataModel(flightLegInfoModels));
      if (numberOfConnectionValidation.ok) {
        setConnectionNumberDataModel(generateConnectionNumberDataModel(flightLegInfoModels));
      }
    }
  }, [eastAirports, westAirports, minConnectionTime, maxConnectionTime, baseDate]);

  const validation = new ConnectionReportValidation(startDate, endDate, baseDate, eastAirports, westAirports);
  const numberOfConnectionValidation = new NumberOfConnectionValidation(maxConnectionTime, minConnectionTime, startDate, endDate, baseDate, eastAirports, westAirports);

  const errors = {
    eastAirports: validation.message('EAST_AIRPORT_*'),
    westAirports: validation.message('WEST_AIRPORT_*'),
    startDate: validation.message('START_DATE_*'),
    endDate: validation.message('END_DATE_*'),
    baseDate: validation.message('BASE_DATE_*'),
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
    if (eastAirports && westAirports) {
      eastAirports.forEach(ea => {
        const connection: any = {};
        connection['airport'] = ea.name;

        westAirports.forEach(wa => {
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

    if (eastAirports && westAirports) {
      weekDay.forEach(w => {
        const model: any = {};
        model['day'] = Weekday[w].toUpperCase().substring(0, 3);

        eastAirports.forEach(airport => {
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

        westAirports.forEach(airport => {
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
            return diff <= converteHHMMtoTotalMinute(maxConnectionTime) && diff >= converteHHMMtoTotalMinute(minConnectionTime);
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

  const exportConnectionTable = (
    <Fragment>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => {
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
          {eastAirports.map(airport => (
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
          ))}
        </ExcelExportColumnGroup>
        <ExcelExportColumnGroup title={preplanName + ' CONNECTIONS'} headerCellOptions={columnGroupCellOptions}>
          {westAirports.map(airport => (
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
          ))}
        </ExcelExportColumnGroup>
        <ExcelExportColumnGroup title="Departure from IKA" headerCellOptions={columnGroupCellOptions}>
          {eastAirports.map(airport => (
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
          ))}
        </ExcelExportColumnGroup>
      </ExcelExport>
    </Fragment>
  );

  const connectionTable = (
    <Table>
      <TableHead>
        <TableRow className={classes.header}>
          <TableCell className={classes.boarder} />
          <TableCell colSpan={eastAirports.length} align="center" className={classes.boarder}>
            Arrival to IKA
          </TableCell>
          <TableCell colSpan={westAirports.length} className={classes.boarder} />

          <TableCell colSpan={eastAirports.length} align="center" className={classes.boarder}>
            Departure from IKA
          </TableCell>
        </TableRow>
        <TableRow className={classes.airportHeader}>
          <TableCell className={classNames(classes.header, classes.boarder)} />
          {eastAirports.map(airport => (
            <TableCell key={airport.id} className={classes.boarder}>
              {airport.name}
            </TableCell>
          ))}
          {westAirports.map(airport => (
            <TableCell key={airport.id} className={classNames(classes.boarder)}>
              {airport.name}
            </TableCell>
          ))}
          {eastAirports.map(airport => (
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
            {eastAirports.map(a => (
              <TableCell key={'from' + a.name} className={classes.boarder}>
                <Fragment>{ct['from' + a.name] && ct['from' + a.name].split('\r\n').map((n: any) => <div>{n}</div>)}</Fragment>
              </TableCell>
            ))}
            {westAirports.map(a => (
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
            {eastAirports.map(a => (
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
        onClick={() => {
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

              const lastRowCells = rows[rows.length - 1].cells!;
              for (let index = 1; index < lastRowCells.length; index++) {
                const cell = lastRowCells[index];
                cell.borderBottom = { color: '#000000', size: 2 };
              }
            }
            connectionNumberExporter.save(options);
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
          title={' '}
          width={50}
          cellOptions={numberOfConnectionExcelStyle.headerCellOption}
          headerCellOptions={numberOfConnectionExcelStyle.headerCellOption}
        />

        <ExcelExportColumnGroup
          title={preplanName + ' Number of Connection (Minimum Connection Time: ' + minConnectionTime + ' Maximum Connection Time: ' + maxConnectionTime + ')'}
          headerCellOptions={numberOfConnectionExcelStyle.headerCellOption}
        >
          {westAirports.map(wa => (
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
      </ExcelExport>
    </Fragment>
  );

  const connectionNumber = (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell className={classNames(classes.connectionHeader, classes.boarder)} />
          {westAirports.map(wa => (
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
            {westAirports.map(wa => (
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
      <InputLabel error={errors.eastAirports !== undefined} htmlFor="east-airport" className={classes.marginBottom1}>
        East Airport
      </InputLabel>
      <MultiSelect
        id="east-airport"
        value={eastAirports}
        options={allAirports}
        getOptionLabel={r => r.name}
        getOptionValue={r => r.id}
        onSelect={value => {
          setViewState({ eastAirports: value ? value.orderBy('name') : [], westAirports, endDate, startDate, baseDate, maxConnectionTime, minConnectionTime });
        }}
        className={classes.marginBottom1}
        error={errors.eastAirports !== undefined}
        helperText={errors.eastAirports}
      />
      <br />
      <InputLabel error={errors.westAirports !== undefined} htmlFor="west-airport" className={classes.marginBottom1}>
        West Airport
      </InputLabel>
      <MultiSelect
        id="west-airport"
        value={westAirports}
        options={allAirports}
        getOptionLabel={r => r.name}
        getOptionValue={r => r.id}
        onSelect={value => {
          setViewState({ eastAirports, westAirports: value ? value.orderBy('name') : [], endDate, startDate, baseDate, maxConnectionTime, minConnectionTime });
        }}
        error={errors.westAirports !== undefined}
        helperText={errors.westAirports}
      />

      <RefiningTextField
        label="Start Date"
        dataType={dataTypes.utcDate}
        value={startDate}
        onChange={({ target: { value: startDate } }) => setViewState({ eastAirports, westAirports, endDate, startDate, baseDate, maxConnectionTime, minConnectionTime })}
        error={errors.startDate !== undefined}
        helperText={errors.startDate}
        disabled
      />

      <RefiningTextField
        label="End Date"
        dataType={dataTypes.utcDate}
        value={endDate}
        onChange={({ target: { value: endDate } }) => setViewState({ eastAirports, westAirports, endDate, startDate, baseDate, maxConnectionTime, minConnectionTime })}
        error={errors.endDate !== undefined}
        helperText={errors.endDate}
        disabled
      />

      <RefiningTextField
        label="Base Date"
        dataType={dataTypes.utcDate}
        value={baseDate}
        onChange={({ target: { value: baseDate } }) => setViewState({ eastAirports, westAirports, endDate, startDate, baseDate, maxConnectionTime, minConnectionTime })}
        error={errors.baseDate !== undefined}
        helperText={errors.baseDate}
      />

      <br />
      <br />

      <div className={classNames(classes.export, classes.marginBottom1)}>{exportConnectionTable}</div>
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

      <RefiningTextField
        label="Minimum Connection Time"
        dataType={dataTypes.daytime}
        value={minConnectionTime}
        onChange={({ target: { value: minConnectionTime } }) => setViewState({ eastAirports, westAirports, endDate, startDate, baseDate, maxConnectionTime, minConnectionTime })}
        error={errors.minConnectionTime !== undefined}
        helperText={errors.minConnectionTime}
      />

      <RefiningTextField
        label="Maximum Connection Time"
        dataType={dataTypes.daytime}
        value={maxConnectionTime}
        onChange={({ target: { value: maxConnectionTime } }) => setViewState({ eastAirports, westAirports, endDate, startDate, baseDate, maxConnectionTime, minConnectionTime })}
        error={errors.maxConnectionTime !== undefined}
        helperText={errors.maxConnectionTime}
      />

      <br />
      <br />

      <div className={classNames(classes.export, classes.marginBottom1)}>{exportConnectionNumber}</div>
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
