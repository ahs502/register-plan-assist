import React, { FC, useState, Fragment } from 'react';
import { Theme, InputLabel, FormControl, TextField, TableHead, TableCell, Table, TableRow, TableBody, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import FlightRequirement, { WeekdayFlightRequirement } from 'src/view-models/FlightRequirement';
import MasterData, { Airport } from '@core/master-data';
import MultiSelect from 'src/components/MultiSelect';
import Weekday from '@core/types/Weekday';
import { ExcelExport, ExcelExportColumn } from '@progress/kendo-react-excel-export';
import { string } from 'prop-types';
import FlightModel from '@core/models/flight/FlightModel';

import WeekdayFlightRequirementModel from '@core/models/flight/WeekdayFlightRequirementModel';
import FlightDefinitionModel from '@core/models/flight/FlightDefinitionModel';
import FlightRequirementModel from '@core/models/flight/FlightRequirementModel';
import Flight from 'src/view-models/flight/Flight';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/view-models/PreplanAircraftRegister';
const allAirports = MasterData.all.airports.items;

const useStyles = makeStyles((theme: Theme) => ({
  west: {
    backgroundColor: '#FFCC99'
  },
  header: {
    backgroundColor: '#F4B084'
  },
  airportHeader: {
    backgroundColor: '#fbe0ce'
  },
  connectionHeader: {
    backgroundColor: '#C6EFCE'
  }
}));

interface ConnectionsReportProps {
  flights: readonly Flight[];
  preplanName: string;
}

interface ConnectionModel {
  eastAirportArrivalToIranFlight: Flight[];
  eastAirportDepartureFromIranFlight: Flight[];
  westAirportArrivalToIranFlight: Flight[];
  westAirportDepartureFromIranFlight: Flight[];
}

type connectionDirection = 'WesttoEast' | 'EasttoWest';

const ConnectionsReport: FC<ConnectionsReportProps> = ({ flights, preplanName }) => {
  const defaultWestAirport = ['BCN', 'DXB', 'ESB', 'EVN', 'GYD', 'IST', 'MXP', 'VKO'];
  const defaultEastAirpot = ['BKK', 'CAN', 'DEL', 'BOM', 'KUL', 'LHE', 'PEK', 'PVG'];
  const [eastAirport, setEastAriport] = useState<readonly Airport[]>(allAirports.filter(a => defaultEastAirpot.indexOf(a.name) != -1));
  const [westAirport, setWestAriport] = useState<readonly Airport[]>(allAirports.filter(a => defaultWestAirport.indexOf(a.name) != -1));
  const [maxConnectionTime, setMaxConnectionTime] = useState<number>(5);
  const [minConnectionTime, setMinConnectionTime] = useState<number>(1);
  const weekDay = Array.range(0, 6);

  let _connectionCountExporter: any = {};
  let connectionCount: any[] = [];
  let _planExporter: ExcelExport | null;
  let planModel: any[] = [];

  const classes = useStyles();

  const formatMinuteToString = (minutes: number): string => {
    if (!minutes) return '';
    return (Math.floor(minutes / 60) % 24).toString().padStart(2, '0') + ':' + (minutes % 60).toString().padStart(2, '0');
  };

  const compareFunction = (a: number, b: number): number => {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  };

  const generateConnectionCountExportData = () => {
    const result: any[] = [];
    eastAirport.forEach(ea => {
      const connection: any = {};
      connection['airport'] = ea.name;

      westAirport.forEach(wa => {
        const eastToWest = getNumberOfConnection(ea, wa, 'EasttoWest');
        const westToEast = getNumberOfConnection(wa, ea, 'WesttoEast');

        connection['to' + wa.name] = eastToWest;
        connection['from' + wa.name] = westToEast;
      });
      result.push(connection);
    });

    connectionCount = result;
  };

  const generatePlanExportData = () => {
    const result: any[] = [];

    weekDay.forEach(w => {
      const model: any = {};
      model['day'] = Weekday[w];

      eastAirport.forEach(airport => {
        const flights = flightPerDay[w].eastAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirport.id === airport.id);
        if (!flights || flights.length == 0) return;

        const stas = flights
          .map(flight => {
            return flight.std.minutes + flight.weekdayRequirement.scope.blockTime;
          })
          .sort(compareFunction);
        model['from' + airport.name] = stas.map(a => formatMinuteToString(a)).join('\r\n');
      });

      eastAirport.forEach(airport => {
        const flights = flightPerDay[w].eastAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirport.id === airport.id);
        if (!flights || flights.length == 0) return;

        const stds = flights
          .map(flight => {
            return flight.std.minutes;
          })
          .sort(compareFunction);
        model['to' + airport.name] = stds.map(a => formatMinuteToString(a)).join('\r\n');
      });

      westAirport.forEach(airport => {
        const arrivalToIran = flightPerDay[w].westAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirport.id === airport.id);
        const departureFromIran = flightPerDay[w].westAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirport.id == airport.id);

        const stas = arrivalToIran.map(flight => flight.std.minutes + flight.weekdayRequirement.scope.blockTime).sort(compareFunction);
        const stds = departureFromIran.map(flight => flight.std.minutes).sort(compareFunction);

        if (stas.length <= 0) return;
        model[airport.name] = Array.range(0, stas.length - 1)
          .map(i => {
            return formatMinuteToString(stds[i]) + '-' + formatMinuteToString(stas[i]);
          })
          .join('\r\n');
      });

      result.push(model);
    });

    planModel = result;
  };

  const getNumberOfConnection = (departureAirport: Airport, arrivalAriport: Airport, direction: connectionDirection): number => {
    let firstFligths: Flight[] = [];
    let secoundFlights: Flight[] = [];

    let result: number = 0;

    weekDay.forEach(w => {
      if (direction === 'EasttoWest') {
        firstFligths = flightPerDay[w].eastAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirport.id === departureAirport.id);
        secoundFlights = flightPerDay[w].westAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirport.id === arrivalAriport.id);
      } else {
        firstFligths = flightPerDay[w].westAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirport.id === departureAirport.id);
        secoundFlights = flightPerDay[w].eastAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirport.id === arrivalAriport.id);
      }

      if (
        firstFligths.some(ff => {
          const sta = (ff.std.minutes + ff.weekdayRequirement.scope.blockTime) % 1440;
          return secoundFlights.some(sf => sf.std.minutes < sta + maxConnectionTime * 60 && sf.std.minutes > sta + minConnectionTime * 60);
        })
      ) {
        result++;
      }
    });

    return result;
  };

  const flightPerDay: { [index: number]: ConnectionModel } = {};

  weekDay.forEach(w => {
    flightPerDay[w] = {
      eastAirportArrivalToIranFlight: [],
      eastAirportDepartureFromIranFlight: [],
      westAirportArrivalToIranFlight: [],
      westAirportDepartureFromIranFlight: []
    } as ConnectionModel;

    flightPerDay[w].eastAirportArrivalToIranFlight = flights.filter(f => {
      var airportValidation = eastAirport.some(airport => f.weekdayRequirement.definition.departureAirport.id === airport.id);
      if (!airportValidation) return false;

      const departureWeekDay = f.weekdayRequirement.day;
      const sta = f.std.minutes + f.weekdayRequirement.scope.blockTime;
      const arrivalWeekDay = sta <= 1440 ? departureWeekDay : (departureWeekDay + 1) % 7;
      if (arrivalWeekDay !== w) return false;

      return true;
    });

    flightPerDay[w].eastAirportDepartureFromIranFlight = flights.filter(f => {
      var airportValidation = eastAirport.some(airport => f.weekdayRequirement.definition.arrivalAirport.id === airport.id);
      if (!airportValidation) return false;
      if (f.weekdayRequirement.day !== w) return false;
      return true;
    });

    flightPerDay[w].westAirportArrivalToIranFlight = flights.filter(f => {
      var airportValidation = westAirport.some(airport => f.weekdayRequirement.definition.departureAirport.id === airport.id);
      if (!airportValidation) return false;

      const departureWeekDay = f.weekdayRequirement.day;
      const sta = f.std.minutes + f.weekdayRequirement.scope.blockTime;
      const arrivalWeekDay = sta <= 1440 ? departureWeekDay : (departureWeekDay + 1) % 7;
      if (arrivalWeekDay !== w) return false;

      return true;
    });

    flightPerDay[w].westAirportDepartureFromIranFlight = flights.filter(f => {
      var airportValidation = westAirport.some(airport => f.weekdayRequirement.definition.arrivalAirport.id === airport.id);
      if (!airportValidation) return false;
      if (f.weekdayRequirement.day !== w) return false;
      return true;
    });
  });

  generateConnectionCountExportData();
  generatePlanExportData();
  //var f = new Flight({ std: 10 } as FlightModel,new WeekdayFlightRequirement({ scope: { blockTime: 10 }, day: 3, flight: { std: 10 } } as WeekdayFlightRequirementModel,new FlightRequirement({ definition: { departureAirportId: '', arrivalAirportId: '' } as FlightDefinitionModel } as FlightRequirementModel)));

  return (
    <Fragment>
      <InputLabel htmlFor="east-airport">East Airport</InputLabel>
      <MultiSelect
        id="east-airport"
        value={eastAirport}
        options={allAirports}
        getOptionLabel={r => r.name}
        getOptionValue={r => r.id}
        onSelect={value => {
          setEastAriport(value);
        }}
      />

      <InputLabel htmlFor="west-airport">West Airport</InputLabel>
      <MultiSelect
        id="west-airport"
        value={westAirport}
        options={allAirports}
        getOptionLabel={r => r.name}
        getOptionValue={r => r.id}
        onSelect={value => {
          setWestAriport(value);
        }}
      />

      <TextField label="Minimum Connection time" type="number" value={minConnectionTime} onChange={e => +e.target.value >= 0 && setMinConnectionTime(+e.target.value)} />
      <TextField label="Maximum Connection time" type="number" value={maxConnectionTime} onChange={e => +e.target.value >= 0 && setMaxConnectionTime(+e.target.value)} />
      <div>
        <Button
          onClick={() => {
            generatePlanExportData();
            debugger;
            if (_planExporter) {
              const options = _planExporter.workbookOptions();
              const rows = options && options.sheets && options.sheets[0] && options.sheets[0].rows;
              if (rows) {
                rows.forEach(r => {
                  if (r.cells) {
                    const numberOfNewLive = r.cells.map(c => (typeof c.value === 'string' ? c.value.split('\r\n').length : 0)).sort(compareFunction);
                    r.height = 20 * numberOfNewLive[numberOfNewLive.length - 1] + 10;
                  }
                });
                //rows[0]!.cells!.forEach(c => (c.background = '#F4B084'));
              }

              _planExporter.save(options);
            }
          }}
        >
          Export to Excel
        </Button>

        <ExcelExport
          data={planModel}
          fileName="Plan.xlsx"
          ref={exporter => {
            _planExporter = exporter;
          }}
        >
          <ExcelExportColumn
            title=" "
            field="day"
            width={100}
            headerCellOptions={{ textAlign: 'center', verticalAlign: 'center', background: '#F4B084' }}
            cellOptions={{ textAlign: 'center', verticalAlign: 'center', background: '#F4B084' }}
          />
          {eastAirport.map(airport => (
            <ExcelExportColumn
              key={airport.id}
              field={'from' + airport.name}
              title={airport.name}
              width={50}
              cellOptions={{ wrap: true, textAlign: 'center', verticalAlign: 'center' }}
              headerCellOptions={{ textAlign: 'center', verticalAlign: 'center', background: '#F4B084' }}
            />
          ))}
          {westAirport.map(airport => (
            <ExcelExportColumn
              key={airport.id}
              field={airport.name}
              title={airport.name}
              width={100}
              cellOptions={{
                wrap: true,
                textAlign: 'center',
                verticalAlign: 'center',
                background: '#fbe0ce',
                borderBottom: { color: '#000000', size: 1 },
                borderLeft: { color: '#000000', size: 1 },
                borderRight: { color: '#000000', size: 1 },
                borderTop: { color: '#000000', size: 1 }
              }}
              headerCellOptions={{ textAlign: 'center', verticalAlign: 'center', background: '#F4B084' }}
            />
          ))}
          {eastAirport.map(airport => (
            <ExcelExportColumn
              key={airport.id}
              field={'to' + airport.name}
              title={airport.name}
              width={50}
              cellOptions={{ wrap: true, textAlign: 'center', verticalAlign: 'center' }}
              headerCellOptions={{ textAlign: 'center', verticalAlign: 'center', background: '#F4B084' }}
            />
          ))}
        </ExcelExport>
      </div>
      <Table>
        <TableHead>
          <TableRow className={classes.header}>
            <TableCell />
            <TableCell colSpan={eastAirport.length} align="center">
              Arrival to IKA
            </TableCell>
            <TableCell colSpan={westAirport.length} />

            <TableCell colSpan={eastAirport.length} align="center">
              Departure from IKA
            </TableCell>
          </TableRow>
          <TableRow className={classes.airportHeader}>
            <TableCell className={classes.header} />
            {eastAirport.map(airport => (
              <TableCell key={airport.id}>{airport.name}</TableCell>
            ))}
            {westAirport.map(airport => (
              <TableCell key={airport.id}>{airport.name}</TableCell>
            ))}
            {eastAirport.map(airport => (
              <TableCell key={airport.id}>{airport.name}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {weekDay.map(w => (
            <TableRow key={w}>
              <TableCell className={classes.header}>{Weekday[w]}</TableCell>
              {eastAirport.map(airport => {
                const flights = flightPerDay[w].eastAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirport.id === airport.id);
                if (!flights || flights.length == 0) return <TableCell key={airport.id} />;

                const stas = flights
                  .map(flight => {
                    return flight.std.minutes + flight.weekdayRequirement.scope.blockTime;
                  })
                  .sort(compareFunction);

                return (
                  <TableCell key={airport.id}>
                    <Fragment>
                      {Array.range(0, stas.length - 1).map(i => {
                        return <div key={i}>{formatMinuteToString(stas[i])}</div>;
                      })}
                    </Fragment>
                  </TableCell>
                );
              })}

              {westAirport.map(airport => {
                const arrivalToIran = flightPerDay[w].westAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirport.id === airport.id);
                const departureFromIran = flightPerDay[w].westAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirport.id == airport.id);

                const stas = arrivalToIran.map(flight => flight.std.minutes + flight.weekdayRequirement.scope.blockTime).sort(compareFunction);
                const stds = departureFromIran.map(flight => flight.std.minutes).sort(compareFunction);

                if (stas.length <= 0) return <TableCell key={airport.id} className={classes.west} />;
                return (
                  <TableCell key={airport.id} className={classes.west}>
                    <Fragment>
                      {Array.range(0, stas.length - 1).map(i => {
                        return (
                          <div key={i}>
                            {formatMinuteToString(stds[i])}-{formatMinuteToString(stas[i])}
                          </div>
                        );
                      })}
                    </Fragment>
                  </TableCell>
                );
              })}

              {eastAirport.map(airport => {
                const flights = flightPerDay[w].eastAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirport.id === airport.id);
                if (!flights || flights.length == 0) return <TableCell key={airport.id} />;
                const stds = flights.map(flight => flight.std.minutes).sort(compareFunction);
                return (
                  <TableCell key={airport.id}>
                    <Fragment>
                      {Array.range(0, stds.length - 1).map(i => {
                        return <div key={i}>{formatMinuteToString(stds[i])}</div>;
                      })}
                    </Fragment>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <br />
      <br />

      <div>
        <Button
          onClick={() => {
            generateConnectionCountExportData();
            debugger;
            _connectionCountExporter.save();
          }}
        >
          Export to Excel
        </Button>

        <ExcelExport
          data={connectionCount}
          fileName="ConnectionCount.xlsx"
          ref={exporter => {
            _connectionCountExporter = exporter;
          }}
        >
          <ExcelExportColumn field="airport" title="Airport" locked={true} width={100} />

          {westAirport.map(wa => (
            <Fragment key={wa.id}>
              <ExcelExportColumn field={'to' + wa.name} title={wa.name} width={100} />
              <ExcelExportColumn field={'from' + wa.name} title={wa.name} width={100} />
            </Fragment>
          ))}
        </ExcelExport>
      </div>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className={classes.connectionHeader} />
            {westAirport.map(wa => (
              <TableCell className={classes.connectionHeader} key={wa.id} colSpan={2} align="center">
                {wa.name}
              </TableCell>
            ))}
          </TableRow>
          {eastAirport.map(ea => (
            <TableRow key={ea.id}>
              <TableCell className={classes.connectionHeader}>{ea.name}</TableCell>
              {westAirport.map(wa => (
                <Fragment key={wa.id}>
                  <TableCell align="center">{getNumberOfConnection(ea, wa, 'EasttoWest')}</TableCell>
                  <TableCell align="center">{getNumberOfConnection(wa, ea, 'WesttoEast')}</TableCell>
                </Fragment>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Fragment>
  );
};

export default ConnectionsReport;
