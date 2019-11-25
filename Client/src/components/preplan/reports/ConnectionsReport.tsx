import React, { FC, useState, Fragment, useEffect } from 'react';
import { Theme, InputLabel, TextField, TableHead, TableCell, Table, TableRow, TableBody, Button } from '@material-ui/core';
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
  }
}));

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
  arrivalTimeToIka: Date[];
}

type connectionDirection = 'WesttoEast' | 'EasttoWest';

const ConnectionsReport: FC<ConnectionsReportProps> = ({ flights, preplanName, fromDate, toDate }) => {
  const allAirports = MasterData.all.airports.items;
  const ika = allAirports.find(a => a.name === 'IKA')!;
  const defaultWestAirport = ['BCN', 'DXB', 'ESB', 'EVN', 'GYD', 'IST', 'MXP', 'VKO'];
  const defaultEastAirpot = ['BKK', 'CAN', 'DEL', 'BOM', 'KUL', 'LHE', 'PEK', 'PVG'];
  const [eastAirport, setEastAriport] = useState<readonly Airport[]>(allAirports.filter(a => defaultEastAirpot.indexOf(a.name) !== -1).orderBy('name'));
  const [westAirport, setWestAriport] = useState<readonly Airport[]>(allAirports.filter(a => defaultWestAirport.indexOf(a.name) !== -1).orderBy('name'));
  const [maxConnectionTime, setMaxConnectionTime] = useState<string>('0500');
  const [minConnectionTime, setMinConnectionTime] = useState<string>('0110');
  const [startDate, setStartDate] = useState(fromDate);
  const [endDate, setEndDate] = useState(toDate);
  const [connectionTableDataModel, setConnectionTableDataModel] = useState<{ [index: string]: any }[]>([]);
  const [connectionNumberDataModel, setConnectionNumberDataModel] = useState<{ [index: string]: any }[]>([]);
  const weekDay = Array.range(0, 6);

  let connectionNumberExporter: ExcelExport | null;
  let connectionTableExporter: ExcelExport | null;

  useEffect(() => {
    const flightLegInfoModels: FlightLegInfoModel[] = [];
    const baseDate = new Date(new Date((startDate.getTime() + endDate.getTime()) / 2));

    const targetFlights = flights.filter(
      f =>
        eastAirport.some(a => a.id === f.departureAirport.id || a.id === f.arrivalAirport.id) ||
        westAirport.some(a => a.id === f.departureAirport.id || a.id === f.arrivalAirport.id)
    );

    eastAirport.forEach(airport => {
      if (!flightLegInfoModels.some(f => f.airport === airport)) {
        flightLegInfoModels.push({ airport: airport, flightInfo: [] });
      }
    });

    westAirport.forEach(airport => {
      if (!flightLegInfoModels.some(f => f.airport === airport)) {
        flightLegInfoModels.push({ airport: airport, flightInfo: [] });
      }
    });

    targetFlights.forEach(flight => {
      const isDepartureFromIKA = flight.departureAirport.name === 'IKA';
      if (isDepartureFromIKA) {
        const utcStd = flight.actualStd.toDate(baseDate);
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
            flightLegInfoModel.flightInfo.push({ weekday: departureWeekDay, arrivalTimeToIka: [], departureTimeFromIKA: [localStd] });
          }
        }
      } else {
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

        const arrivalWeekDay = (flight.day + Math.floor(flight.actualStd.minutes / 1440) + diffLocalStdandUtcStd + (diffLocalStdandLocalSta === -1 ? 1 : 0) + 7) % 7;

        const flightLegInfoModel = flightLegInfoModels.find(f => f.airport.id === flight.departureAirport.id);
        if (flightLegInfoModel) {
          const flightInfo = flightLegInfoModel.flightInfo.find(fi => fi.weekday === arrivalWeekDay);
          if (flightInfo) {
            flightInfo.arrivalTimeToIka.push(localSta);
          } else {
            flightLegInfoModel.flightInfo.push({ weekday: arrivalWeekDay, arrivalTimeToIka: [localSta], departureTimeFromIKA: [] });
          }
        }
      }
    });

    setConnectionTableDataModel(generateConnectionTableDataModel(flightLegInfoModels));
    setConnectionNumberDataModel(generateConnectionNumberDataModel(flightLegInfoModels));
  }, [eastAirport, westAirport, minConnectionTime, maxConnectionTime, startDate, endDate]);

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
    if (eastAirport && westAirport) {
      eastAirport.forEach(ea => {
        const connection: any = {};
        connection['airport'] = ea.name;

        westAirport.forEach(wa => {
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

    if (eastAirport && westAirport) {
      weekDay.forEach(w => {
        const model: any = {};
        model['day'] = Weekday[w].toUpperCase().substring(0, 3);

        eastAirport.forEach(airport => {
          model['from' + airport.name] = model['to' + airport.name] = '';
          const flightLegInfoModel = flightLegInfoModels.find(f => f.airport.id === airport.id);
          if (flightLegInfoModel) {
            const flightInfo = flightLegInfoModel.flightInfo.find(fi => fi.weekday === w);
            if (flightInfo) {
              model['from' + airport.name] = flightInfo.arrivalTimeToIka
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

        westAirport.forEach(airport => {
          model[airport.name] = '';
          const flightLegInfoModel = flightLegInfoModels.find(f => f.airport.id === airport.id);

          if (flightLegInfoModel) {
            const flightInfo = flightLegInfoModel.flightInfo.find(fi => fi.weekday === w);
            if (flightInfo) {
              const stas = flightInfo.arrivalTimeToIka.sort((a, b) => compareFunction(a.getTime(), b.getTime()));
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
        fromFlightInfo.arrivalTimeToIka.some(staToIka => {
          return toFlightInfo.departureTimeFromIKA.some(stdFromIka => {
            const diff = (stdFromIka.getUTCHours() - staToIka.getUTCHours()) * 60 + (stdFromIka.getUTCMinutes() - staToIka.getUTCMinutes());
            return diff < converteHHMMtoTotalMinute(maxConnectionTime) && diff >= converteHHMMtoTotalMinute(minConnectionTime);
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
          {eastAirport.map(airport => (
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
          {westAirport.map(airport => (
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
          {eastAirport.map(airport => (
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
          <TableCell colSpan={eastAirport.length} align="center" className={classes.boarder}>
            Arrival to IKA
          </TableCell>
          <TableCell colSpan={westAirport.length} className={classes.boarder} />

          <TableCell colSpan={eastAirport.length} align="center" className={classes.boarder}>
            Departure from IKA
          </TableCell>
        </TableRow>
        <TableRow className={classes.airportHeader}>
          <TableCell className={classNames(classes.header, classes.boarder)} />
          {eastAirport.map(airport => (
            <TableCell key={airport.id} className={classes.boarder}>
              {airport.name}
            </TableCell>
          ))}
          {westAirport.map(airport => (
            <TableCell key={airport.id} className={classNames(classes.boarder)}>
              {airport.name}
            </TableCell>
          ))}
          {eastAirport.map(airport => (
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
            {eastAirport.map(a => (
              <TableCell key={'from' + a.name} className={classes.boarder}>
                <Fragment>{ct['from' + a.name] && ct['from' + a.name].split('\r\n').map((n: any) => <div>{n}</div>)}</Fragment>
              </TableCell>
            ))}
            {westAirport.map(a => (
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
            {eastAirport.map(a => (
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
          {westAirport.map(wa => (
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
          {westAirport.map(wa => (
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
            {westAirport.map(wa => (
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
      <InputLabel htmlFor="east-airport" className={classes.marginBottom1}>
        East Airport
      </InputLabel>

      <MultiSelect
        id="east-airport"
        value={eastAirport}
        options={allAirports}
        getOptionLabel={r => r.name}
        getOptionValue={r => r.id}
        onSelect={value => {
          setEastAriport(value ? value.orderBy('name') : []);
        }}
        className={classes.marginBottom1}
      />
      <br />
      <InputLabel htmlFor="west-airport" className={classes.marginBottom1}>
        West Airport
      </InputLabel>
      <MultiSelect
        id="west-airport"
        value={westAirport}
        options={allAirports}
        getOptionLabel={r => r.name}
        getOptionValue={r => r.id}
        onSelect={value => {
          setWestAriport(value ? value.orderBy('name') : []);
        }}
      />

      <TextField
        className={classNames(classes.marginRight1, classes.marginBottom2)}
        label=" Start Date"
        onChange={e => {
          const value = e.target.value;
          if (!value) return;
          const ticks = Date.parse(value);
          if (ticks) {
            setStartDate(new Date(ticks));
          }
        }}
      />

      <TextField
        className={classNames(classes.marginRight1, classes.marginBottom2)}
        label="End Date"
        onChange={e => {
          const value = e.target.value;
          if (!value) return;
          const ticks = Date.parse(value);
          if (ticks) {
            setEndDate(new Date(ticks));
          }
        }}
      />

      <br />

      <div className={classNames(classes.export, classes.marginBottom1)}>{exportConnectionTable}</div>
      <div className={classes.tableContainer}>{connectionTable}</div>
      <br />
      <br />

      <TextField
        className={classNames(classes.marginBottom2, classes.connectionTime)}
        label="Minimum Connection Time"
        type="text"
        value={minConnectionTime}
        onChange={e => {
          setMinConnectionTime(e.target.value);
        }}
      />
      <TextField
        className={classNames(classes.marginBottom2, classes.connectionTime)}
        label="Maximum Connection Time"
        type="text"
        value={maxConnectionTime}
        onChange={e => {
          setMaxConnectionTime(e.target.value);
        }}
      />

      <div className={classNames(classes.export, classes.marginBottom1)}>{exportConnectionNumber}</div>
      <div className={classes.tableContainer}>{connectionNumber}</div>
    </Fragment>
  );
};

export default ConnectionsReport;

function converteHHMMtoTotalMinute(HHMM: string): number {
  const hour = +HHMM.substr(0, 2);
  const minutes = +HHMM.substr(2, 2);
  return hour * 60 + minutes;
}
