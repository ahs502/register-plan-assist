import React, { FC, useState, Fragment } from 'react';
import { Theme, InputLabel, FormControl, TextField, TableHead, TableCell, Table, TableRow, TableBody, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import FlightRequirement, { Flight, WeekdayFlightRequirement } from 'src/view-models/FlightRequirement';
import MasterData, { Airport } from '@core/master-data';
import MultiSelect from 'src/components/MultiSelect';
import Weekday from '@core/types/Weekday';
import FlightRequirementModel, { FlightModel, WeekdayFlightRequirementModel, FlightDefinitionModel } from '@core/models/FlightRequirementModel';
import { ExcelExport, ExcelExportColumn } from '@progress/kendo-react-excel-export';
import { string } from 'prop-types';

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

  const dummyflights: Flight[] = [];
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
        const flights = flightPerDay[w].eastAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirportId === airport.id);
        if (!flights || flights.length == 0) return;

        const stas = flights
          .map(flight => {
            return flight.std.minutes + flight.weekdayRequirement.scope.blockTime;
          })
          .sort(compareFunction);
        model['from' + airport.name] = stas.map(a => formatMinuteToString(a)).join('\r\n');
      });

      eastAirport.forEach(airport => {
        const flights = flightPerDay[w].eastAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirportId === airport.id);
        if (!flights || flights.length == 0) return;

        const stds = flights
          .map(flight => {
            return flight.std.minutes;
          })
          .sort(compareFunction);
        model['to' + airport.name] = stds.map(a => formatMinuteToString(a)).join('\r\n');
      });

      westAirport.forEach(airport => {
        const arrivalToIran = flightPerDay[w].westAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirportId === airport.id);
        const departureFromIran = flightPerDay[w].westAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirportId == airport.id);

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
        firstFligths = flightPerDay[w].eastAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirportId === departureAirport.id);
        secoundFlights = flightPerDay[w].westAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirportId === arrivalAriport.id);
      } else {
        firstFligths = flightPerDay[w].westAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirportId === departureAirport.id);
        secoundFlights = flightPerDay[w].eastAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirportId === arrivalAriport.id);
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

  fillDummyDate(dummyflights);

  const flightPerDay: { [index: number]: ConnectionModel } = {};

  weekDay.forEach(w => {
    flightPerDay[w] = {
      eastAirportArrivalToIranFlight: [],
      eastAirportDepartureFromIranFlight: [],
      westAirportArrivalToIranFlight: [],
      westAirportDepartureFromIranFlight: []
    } as ConnectionModel;

    flightPerDay[w].eastAirportArrivalToIranFlight = dummyflights.filter(f => {
      var airportValidation = eastAirport.some(airport => f.weekdayRequirement.definition.departureAirportId === airport.id);
      if (!airportValidation) return false;

      const departureWeekDay = f.weekdayRequirement.day;
      const sta = f.std.minutes + f.weekdayRequirement.scope.blockTime;
      const arrivalWeekDay = sta <= 1440 ? departureWeekDay : (departureWeekDay + 1) % 7;
      if (arrivalWeekDay !== w) return false;

      return true;
    });

    flightPerDay[w].eastAirportDepartureFromIranFlight = dummyflights.filter(f => {
      var airportValidation = eastAirport.some(airport => f.weekdayRequirement.definition.arrivalAirportId === airport.id);
      if (!airportValidation) return false;
      if (f.weekdayRequirement.day !== w) return false;
      return true;
    });

    flightPerDay[w].westAirportArrivalToIranFlight = dummyflights.filter(f => {
      var airportValidation = westAirport.some(airport => f.weekdayRequirement.definition.departureAirportId === airport.id);
      if (!airportValidation) return false;

      const departureWeekDay = f.weekdayRequirement.day;
      const sta = f.std.minutes + f.weekdayRequirement.scope.blockTime;
      const arrivalWeekDay = sta <= 1440 ? departureWeekDay : (departureWeekDay + 1) % 7;
      if (arrivalWeekDay !== w) return false;

      return true;
    });

    flightPerDay[w].westAirportDepartureFromIranFlight = dummyflights.filter(f => {
      var airportValidation = westAirport.some(airport => f.weekdayRequirement.definition.arrivalAirportId === airport.id);
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
            width={60}
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
                const flights = flightPerDay[w].eastAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirportId === airport.id);
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
                const arrivalToIran = flightPerDay[w].westAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirportId === airport.id);
                const departureFromIran = flightPerDay[w].westAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirportId == airport.id);

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
                const flights = flightPerDay[w].eastAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirportId === airport.id);
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

function fillDummyDate(flight: Flight[]) {
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 0, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000033', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1110 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 0, flight: { std: 1110 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 295 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 0, flight: { std: 295 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000350', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 0, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 450 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 450 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 330 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 0, flight: { std: 330 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000000033' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 75 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 0, flight: { std: 75 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000000350' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 825 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 0, flight: { std: 825 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 405 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 0, flight: { std: 405 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 720 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 720 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 795 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 795 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 285 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 285 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 375 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 375 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 615 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 135 }, day: 0, flight: { std: 615 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 135 }, day: 0, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1005 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 0, flight: { std: 1005 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004442', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 60 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 60 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 380 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 380 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 0, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 600 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 0, flight: { std: 600 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 970 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 0, flight: { std: 970 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 905 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 0, flight: { std: 905 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 120 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 120 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 240 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 240 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 80 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 80 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 840 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 0, flight: { std: 840 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004442' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 220 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 220 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 1150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 830 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 830 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 880 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 0, flight: { std: 880 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 0, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 0, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001070', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 165 }, day: 0, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001070' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 765 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 0, flight: { std: 765 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 225 }, day: 0, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004007' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 0, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005545' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 510 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 0, flight: { std: 510 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009173' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 0, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1185 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 0, flight: { std: 1185 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 675 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 675 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 0, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 975 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 975 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1410 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 1410 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 315 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 315 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 975 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 135 }, day: 0, flight: { std: 975 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 975 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 0, flight: { std: 975 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002937', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 210 }, day: 0, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004007', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 330 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 330 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004442', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 0, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005545', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 195 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 165 }, day: 0, flight: { std: 195 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006248', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 755 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 755 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 890 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 890 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 510 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 510 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 910 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 910 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 165 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 0, flight: { std: 165 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004442' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 580 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 0, flight: { std: 580 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 105 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 0, flight: { std: 105 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 660 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 0, flight: { std: 660 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009173', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 285 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 285 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 935 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 445 }, day: 0, flight: { std: 935 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000397', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 0, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 820 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 295 }, day: 0, flight: { std: 820 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005317' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 315 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 0, flight: { std: 315 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 0, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006443' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 555 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 0, flight: { std: 555 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1200 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 315 }, day: 0, flight: { std: 1200 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005317', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 565 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 0, flight: { std: 565 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 915 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 0, flight: { std: 915 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006443', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 0, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 75 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 0, flight: { std: 75 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 170 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 0, flight: { std: 170 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 960 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 125 }, day: 0, flight: { std: 960 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000546', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 590 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 0, flight: { std: 590 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 280 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 280 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 60 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 0, flight: { std: 60 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 0, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 75 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 0, flight: { std: 75 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000003603', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 750 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 0, flight: { std: 750 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004847', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 910 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 0, flight: { std: 910 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005186', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 0, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005186', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 0, flight: { std: 150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 870 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 870 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 870 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 870 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 750 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 115 }, day: 0, flight: { std: 750 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 585 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 0, flight: { std: 585 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000007677', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 0, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 440 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 0, flight: { std: 440 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 440 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 440 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 30 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 0, flight: { std: 30 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 795 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 0, flight: { std: 795 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000546' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 0, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 0, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1035 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 1035 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000003603' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 630 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 0, flight: { std: 630 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004847' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 790 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 0, flight: { std: 790 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000005186' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 185 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 0, flight: { std: 185 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000005186' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 710 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 710 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 135 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 0, flight: { std: 135 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 590 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 590 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 435 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 0, flight: { std: 435 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000007677' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 0, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 780 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 780 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008669' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 100 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 0, flight: { std: 100 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008889' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 520 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 0, flight: { std: 520 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009181' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 230 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 0, flight: { std: 230 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009227' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 0, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008669', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 515 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 130 }, day: 0, flight: { std: 515 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008889', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 265 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 0, flight: { std: 265 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008889', arrivalAirportId: '7092901520000009174' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 390 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 0, flight: { std: 390 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009174', arrivalAirportId: '7092901520000008889' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 0, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009181', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 365 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 0, flight: { std: 365 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009227', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 140 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 0, flight: { std: 140 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 135 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 365 }, day: 0, flight: { std: 135 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005045' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 0, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 200 }, day: 0, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000008952' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 495 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 0, flight: { std: 495 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 900 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 570 }, day: 0, flight: { std: 900 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000003099', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 590 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 310 }, day: 0, flight: { std: 590 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005045', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 0, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1260 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 225 }, day: 0, flight: { std: 1260 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008952', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 340 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 130 }, day: 1, flight: { std: 340 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000350', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 1, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 575 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 1, flight: { std: 575 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000009177' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 330 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 330 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 120 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 1, flight: { std: 120 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000000350' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 1, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 1, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 540 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 540 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 405 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 405 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 720 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 720 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 795 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 795 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 375 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 375 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 675 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 675 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 900 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 1, flight: { std: 900 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 255 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 255 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000009177' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1155 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 135 }, day: 1, flight: { std: 1155 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 380 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 1, flight: { std: 380 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 60 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 1, flight: { std: 60 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 670 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 1, flight: { std: 670 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 730 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 730 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 1, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 600 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 600 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1120 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 1, flight: { std: 1120 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 905 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 1, flight: { std: 905 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 130 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 130 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 240 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 240 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 510 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 510 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 80 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 80 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 220 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 1, flight: { std: 220 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 865 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 1, flight: { std: 865 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 970 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 1, flight: { std: 970 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 435 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 1, flight: { std: 435 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 715 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 715 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 405 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 1, flight: { std: 405 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000009177' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 1, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 1, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 125 }, day: 1, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000851', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 1, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001070', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1040 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 1, flight: { std: 1040 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001353', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 405 }, day: 1, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000397' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 1, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000851' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 165 }, day: 1, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001070' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 765 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 1, flight: { std: 765 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 120 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 270 }, day: 1, flight: { std: 120 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002059' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 225 }, day: 1, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004007' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 315 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 315 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005545' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 680 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 1, flight: { std: 680 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009171' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 1, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009173' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009175' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 120 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 270 }, day: 1, flight: { std: 120 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000010175' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 1, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 490 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 240 }, day: 1, flight: { std: 490 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002059', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1155 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 1155 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 210 }, day: 1, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004007', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 565 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 565 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005545', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 1, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 755 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 1, flight: { std: 755 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 75 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 1, flight: { std: 75 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 890 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 1, flight: { std: 890 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 865 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 1, flight: { std: 865 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001353' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 1, flight: { std: 1150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 830 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 1, flight: { std: 830 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 580 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 1, flight: { std: 580 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 105 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 1, flight: { std: 105 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 840 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 1, flight: { std: 840 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009171', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 330 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 1, flight: { std: 330 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009173', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 315 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 1, flight: { std: 315 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009175', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 1, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 540 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 1, flight: { std: 540 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 240 }, day: 1, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000010175', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 140 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 1, flight: { std: 140 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 1, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 975 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 390 }, day: 1, flight: { std: 975 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002937' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 1, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006443' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 495 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 1, flight: { std: 495 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 555 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 1, flight: { std: 555 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 915 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 1, flight: { std: 915 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006443', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 1, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 910 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 910 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 490 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 1, flight: { std: 490 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000001855' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 390 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 1, flight: { std: 390 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 170 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 1, flight: { std: 170 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 390 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 1, flight: { std: 390 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000001855' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 60 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 1, flight: { std: 60 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 345 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 1, flight: { std: 345 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001849', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 750 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 1, flight: { std: 750 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001849', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 395 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 1, flight: { std: 395 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 1, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 485 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 30 }, day: 1, flight: { std: 485 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000004939' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 585 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 50 }, day: 1, flight: { std: 585 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 615 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 1, flight: { std: 615 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 90 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 1, flight: { std: 90 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000003603', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 550 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 30 }, day: 1, flight: { std: 550 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004939', arrivalAirportId: '7092901520000001855' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 690 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 1, flight: { std: 690 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 65 }, day: 1, flight: { std: 150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 870 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 1, flight: { std: 870 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 750 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 115 }, day: 1, flight: { std: 750 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 825 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 1, flight: { std: 825 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 255 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 1, flight: { std: 255 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 310 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 1, flight: { std: 310 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000001855' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 495 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 1, flight: { std: 495 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 1, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 440 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 1, flight: { std: 440 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 680 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 1, flight: { std: 680 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 405 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 405 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008147', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 30 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 1, flight: { std: 30 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1000 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 1000 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000546' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 1, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 225 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 1, flight: { std: 225 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001849' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 630 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 1, flight: { std: 630 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001849' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 135 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 1, flight: { std: 135 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001855' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1035 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 1, flight: { std: 1035 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000003603' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 710 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 1, flight: { std: 710 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 590 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 1, flight: { std: 590 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 935 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 1, flight: { std: 935 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 1, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 185 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 1, flight: { std: 185 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 1, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008147' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009183' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 350 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 1, flight: { std: 350 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009183', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 970 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 495 }, day: 1, flight: { std: 970 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000003099' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 130 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 345 }, day: 1, flight: { std: 130 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004755' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 470 }, day: 1, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005013' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 170 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 325 }, day: 1, flight: { std: 170 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006983' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 200 }, day: 1, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000008952' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1005 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 525 }, day: 1, flight: { std: 1005 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000010173' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 565 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 325 }, day: 1, flight: { std: 565 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004755', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 595 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 285 }, day: 1, flight: { std: 595 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006983', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1260 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 225 }, day: 1, flight: { std: 1260 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008952', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 245 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 65 }, day: 2, flight: { std: 245 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 600 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 2, flight: { std: 600 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000350', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 2, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 760 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 2, flight: { std: 760 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 375 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 2, flight: { std: 375 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000000350' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 375 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 2, flight: { std: 375 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 0 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 2, flight: { std: 0 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006248' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 825 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 2, flight: { std: 825 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 375 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 2, flight: { std: 375 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 750 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 2, flight: { std: 750 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 2, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 375 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 375 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 2, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 600 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 2, flight: { std: 600 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 2, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006248', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 2, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 2, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 570 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 2, flight: { std: 570 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 2, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 130 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 65 }, day: 2, flight: { std: 130 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 900 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 2, flight: { std: 900 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 205 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 205 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 910 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 910 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 80 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 80 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 865 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 2, flight: { std: 865 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 375 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 2, flight: { std: 375 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 105 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 2, flight: { std: 105 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 2, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 285 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 285 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 700 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 700 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 615 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 615 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000350', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 135 }, day: 2, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000350', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 935 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 445 }, day: 2, flight: { std: 935 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000397', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 2, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 2, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 350 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 115 }, day: 2, flight: { std: 350 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001353', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 700 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 2, flight: { std: 700 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001353', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 765 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 765 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000350' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 90 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 90 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 225 }, day: 2, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004007' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 115 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 210 }, day: 2, flight: { std: 115 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004577' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 2, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 315 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 2, flight: { std: 315 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 2, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005545' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 115 }, day: 2, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000001353' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1185 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 2, flight: { std: 1185 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1140 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 2, flight: { std: 1140 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 675 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 675 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1155 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 1155 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1410 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 1410 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1365 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 1365 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 975 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 135 }, day: 2, flight: { std: 975 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 255 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 2, flight: { std: 255 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 210 }, day: 2, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004007', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 2, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004442', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 405 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 225 }, day: 2, flight: { std: 405 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004577', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 2, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 565 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 2, flight: { std: 565 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 2, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005545', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 60 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 60 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 380 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 380 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 755 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 2, flight: { std: 755 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 435 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 2, flight: { std: 435 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000000350' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 75 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 2, flight: { std: 75 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 890 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 890 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 185 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 2, flight: { std: 185 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001353' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 510 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 510 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 870 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 2, flight: { std: 870 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004442' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 220 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 220 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 1150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 580 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 2, flight: { std: 580 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 405 }, day: 2, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000397' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 140 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 2, flight: { std: 140 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 765 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 2, flight: { std: 765 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 495 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 2, flight: { std: 495 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 2, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 975 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 2, flight: { std: 975 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002937', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 915 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 2, flight: { std: 915 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006443', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1035 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 1035 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 830 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 830 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1090 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 2, flight: { std: 1090 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 170 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 2, flight: { std: 170 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 50 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 2, flight: { std: 50 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000546', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 590 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 2, flight: { std: 590 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 280 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 280 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 60 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 2, flight: { std: 60 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 2, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 90 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 90 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000003603', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 395 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 2, flight: { std: 395 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004847', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 2, flight: { std: 150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 870 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 870 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 870 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 870 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 750 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 2, flight: { std: 750 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 2, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 440 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 2, flight: { std: 440 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 440 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 440 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 950 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 2, flight: { std: 950 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 30 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 2, flight: { std: 30 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1095 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 2, flight: { std: 1095 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 2, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000003603' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 2, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004847' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 710 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 710 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 135 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 2, flight: { std: 135 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 590 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 590 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1095 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 2, flight: { std: 1095 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000007677' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 2, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 780 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 780 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008669' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 100 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 2, flight: { std: 100 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008889' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 460 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 2, flight: { std: 460 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009180' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 520 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 2, flight: { std: 520 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009181' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 230 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 2, flight: { std: 230 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009227' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 805 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 2, flight: { std: 805 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009473' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 2, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008669', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 2, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008889', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 580 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 2, flight: { std: 580 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009180', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 2, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009181', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 365 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 2, flight: { std: 365 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009227', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 925 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 2, flight: { std: 925 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009473', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 2, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 495 }, day: 2, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000003099' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 2, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006443' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 555 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 2, flight: { std: 555 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 900 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 570 }, day: 2, flight: { std: 900 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000003099', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 530 }, day: 2, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005013', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 910 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 570 }, day: 2, flight: { std: 910 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000010173', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 3, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1065 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 1065 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 330 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 3, flight: { std: 330 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 825 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 3, flight: { std: 825 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 0 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 3, flight: { std: 0 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006248' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 3, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 405 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 3, flight: { std: 405 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 720 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 720 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 795 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 795 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 375 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 375 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 675 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 675 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 510 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 510 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 135 }, day: 3, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 970 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 3, flight: { std: 970 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004442', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 3, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006248', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 380 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 3, flight: { std: 380 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 670 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 670 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 3, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 600 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 3, flight: { std: 600 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1110 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 3, flight: { std: 1110 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 885 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 3, flight: { std: 885 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 145 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 145 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 240 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 240 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 510 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 510 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 685 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 3, flight: { std: 685 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 790 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 3, flight: { std: 790 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004442' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 220 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 220 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 1150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 830 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 830 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 865 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 3, flight: { std: 865 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 965 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 3, flight: { std: 965 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 105 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 3, flight: { std: 105 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 3, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 285 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 285 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 700 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 700 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 615 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 615 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000350', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1410 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 1410 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000350', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 975 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 135 }, day: 3, flight: { std: 975 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000350', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 3, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 125 }, day: 3, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000851', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 430 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 3, flight: { std: 430 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001353', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 450 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 450 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000000350' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000350' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 3, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000851' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 90 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 90 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 225 }, day: 3, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004007' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 3, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004781' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 315 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 3, flight: { std: 315 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 3, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 680 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 680 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005545' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 3, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006443' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009171' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1185 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 3, flight: { std: 1185 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000000350' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 680 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 200 }, day: 3, flight: { std: 680 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000004781' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 3, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 740 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 3, flight: { std: 740 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 240 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 3, flight: { std: 240 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008952' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 285 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 285 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1155 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 1155 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 255 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 3, flight: { std: 255 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 210 }, day: 3, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004007', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 970 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 130 }, day: 3, flight: { std: 970 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004781', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 410 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 3, flight: { std: 410 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004781', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 565 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 3, flight: { std: 565 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 3, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 840 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 840 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005545', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 60 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 60 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 755 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 3, flight: { std: 755 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 430 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 115 }, day: 3, flight: { std: 430 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000000350' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 890 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 890 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 250 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 3, flight: { std: 250 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001353' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 920 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 920 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 80 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 80 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 580 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 3, flight: { std: 580 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 490 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 190 }, day: 3, flight: { std: 490 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008952', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 315 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 315 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009171', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 935 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 445 }, day: 3, flight: { std: 935 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000397', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 3, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001070', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 165 }, day: 3, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001070' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 140 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 3, flight: { std: 140 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 765 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 3, flight: { std: 765 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 975 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 390 }, day: 3, flight: { std: 975 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002937' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 910 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 290 }, day: 3, flight: { std: 910 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005317' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 3, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 495 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 3, flight: { std: 495 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 3, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1290 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 320 }, day: 3, flight: { std: 1290 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005317', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 3, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 3, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 75 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 3, flight: { std: 75 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 390 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 3, flight: { std: 390 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 170 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 3, flight: { std: 170 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 60 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 3, flight: { std: 60 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 3, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 750 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 3, flight: { std: 750 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001849', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 90 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 90 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000003603', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000003603', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 3, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005186', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 690 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 3, flight: { std: 690 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 65 }, day: 3, flight: { std: 150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 870 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 870 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 750 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 3, flight: { std: 750 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 825 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 3, flight: { std: 825 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 90 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 3, flight: { std: 90 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000007677', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 255 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 3, flight: { std: 255 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 495 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 3, flight: { std: 495 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 3, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 440 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 3, flight: { std: 440 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 405 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 405 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008147', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 30 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 3, flight: { std: 30 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1000 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 3, flight: { std: 1000 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000546' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 3, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 185 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 65 }, day: 3, flight: { std: 185 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 630 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 3, flight: { std: 630 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001849' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 785 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 3, flight: { std: 785 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000003603' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 3, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000005186' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 710 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 710 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 590 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 3, flight: { std: 590 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 3, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 3, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008147' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 520 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 3, flight: { std: 520 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009181' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 115 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 3, flight: { std: 115 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009183' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 795 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 3, flight: { std: 795 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009473' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 450 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 3, flight: { std: 450 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000010170' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 390 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 3, flight: { std: 390 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009174', arrivalAirportId: '7092901520000009183' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 3, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009181', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 495 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 3, flight: { std: 495 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009183', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 285 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 3, flight: { std: 285 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009183', arrivalAirportId: '7092901520000009174' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 915 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 3, flight: { std: 915 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009473', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 600 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 3, flight: { std: 600 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000010170', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 570 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 270 }, day: 3, flight: { std: 570 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001126', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 165 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 300 }, day: 3, flight: { std: 165 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001126' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 3, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 970 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 490 }, day: 3, flight: { std: 970 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000003099' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 470 }, day: 3, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005013' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 170 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 325 }, day: 3, flight: { std: 170 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006983' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 555 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 3, flight: { std: 555 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 900 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 570 }, day: 3, flight: { std: 900 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000003099', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 915 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 3, flight: { std: 915 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006443', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 595 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 285 }, day: 3, flight: { std: 595 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006983', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 255 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 4, flight: { std: 255 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1255 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 4, flight: { std: 1255 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000350', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 4, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 760 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 4, flight: { std: 760 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1035 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 4, flight: { std: 1035 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000000350' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 4, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 4, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 375 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 4, flight: { std: 375 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 750 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 4, flight: { std: 750 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 375 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 375 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 435 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 135 }, day: 4, flight: { std: 435 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 60 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 4, flight: { std: 60 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 4, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 380 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 4, flight: { std: 380 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 840 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 4, flight: { std: 840 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 4, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 4, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 570 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 4, flight: { std: 570 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 4, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 130 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 65 }, day: 4, flight: { std: 130 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 900 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 4, flight: { std: 900 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 215 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 4, flight: { std: 215 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 80 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 80 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 220 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 4, flight: { std: 220 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 4, flight: { std: 1150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 830 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 4, flight: { std: 830 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 865 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 4, flight: { std: 865 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 385 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 65 }, day: 4, flight: { std: 385 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 4, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 700 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 4, flight: { std: 700 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 4, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 4, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 4, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001353', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 670 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 4, flight: { std: 670 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001353', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 405 }, day: 4, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000397' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 765 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 4, flight: { std: 765 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 870 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 870 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 225 }, day: 4, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004007' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 4, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 4, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005545' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1410 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 4, flight: { std: 1410 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006248' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 200 }, day: 4, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000008952' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 4, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009173' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 540 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 540 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009175' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 4, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 485 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 4, flight: { std: 485 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000001353' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 675 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 675 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 4, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1035 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 1035 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 210 }, day: 4, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004007', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1030 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 4, flight: { std: 1030 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004442', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 4, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 4, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 375 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 375 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005545', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 755 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 4, flight: { std: 755 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 915 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 4, flight: { std: 915 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006443', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 75 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 4, flight: { std: 75 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 890 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 4, flight: { std: 890 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 125 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 4, flight: { std: 125 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001353' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 510 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 510 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 910 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 910 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 840 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 4, flight: { std: 840 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004442' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 580 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 4, flight: { std: 580 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 105 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 4, flight: { std: 105 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1260 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 225 }, day: 4, flight: { std: 1260 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008952', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 330 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 4, flight: { std: 330 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009173', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 705 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 4, flight: { std: 705 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009175', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 285 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 4, flight: { std: 285 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 140 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 4, flight: { std: 140 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 4, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 315 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 4, flight: { std: 315 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 4, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006443' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 495 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 4, flight: { std: 495 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 555 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 4, flight: { std: 555 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 875 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 485 }, day: 4, flight: { std: 875 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002937', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 565 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 4, flight: { std: 565 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 415 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 4, flight: { std: 415 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000001855' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1090 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 4, flight: { std: 1090 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 170 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 4, flight: { std: 170 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 50 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 4, flight: { std: 50 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000546', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 590 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 4, flight: { std: 590 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 280 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 4, flight: { std: 280 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 60 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 4, flight: { std: 60 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 4, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 405 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 4, flight: { std: 405 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 750 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 4, flight: { std: 750 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001849', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 310 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 4, flight: { std: 310 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 510 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 4, flight: { std: 510 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 4, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000003603', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 910 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 4, flight: { std: 910 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005186', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 4, flight: { std: 150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 870 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 870 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 870 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 4, flight: { std: 870 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 750 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 4, flight: { std: 750 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 4, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 440 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 4, flight: { std: 440 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 440 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 440 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 950 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 4, flight: { std: 950 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 30 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 4, flight: { std: 30 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 4, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 4, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 4, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 630 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 4, flight: { std: 630 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001849' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 170 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 4, flight: { std: 170 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001855' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 785 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 4, flight: { std: 785 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000003603' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 790 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 4, flight: { std: 790 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000005186' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 710 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 4, flight: { std: 710 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 590 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 4, flight: { std: 590 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1095 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 4, flight: { std: 1095 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000007677' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 935 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 4, flight: { std: 935 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 4, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 100 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 4, flight: { std: 100 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008889' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 520 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 4, flight: { std: 520 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009181' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 230 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 4, flight: { std: 230 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009227' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 125 }, day: 4, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008889', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 4, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009181', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 365 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 4, flight: { std: 365 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009227', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 510 }, day: 4, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000003099' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 135 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 365 }, day: 4, flight: { std: 135 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005045' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 170 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 325 }, day: 4, flight: { std: 170 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006983' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1005 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 525 }, day: 4, flight: { std: 1005 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000010173' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 900 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 570 }, day: 4, flight: { std: 900 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000003099', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 530 }, day: 4, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005013', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 590 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 310 }, day: 4, flight: { std: 590 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005045', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 595 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 285 }, day: 4, flight: { std: 595 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006983', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000033', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1110 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 5, flight: { std: 1110 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 275 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 275 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000350', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1065 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 5, flight: { std: 1065 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 5, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 440 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 5, flight: { std: 440 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 330 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 330 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000000033' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 45 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 155 }, day: 5, flight: { std: 45 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000000350' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 5, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 825 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 825 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 405 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 405 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 720 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 720 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 795 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 795 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 375 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 375 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 485 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 485 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000009177' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 600 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 135 }, day: 5, flight: { std: 600 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 380 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 5, flight: { std: 380 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1320 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 5, flight: { std: 1320 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 60 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 5, flight: { std: 60 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 5, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 670 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 5, flight: { std: 670 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 5, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 600 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 600 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 975 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 5, flight: { std: 975 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 895 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 5, flight: { std: 895 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 75 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 5, flight: { std: 75 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 145 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 5, flight: { std: 145 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 240 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 240 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 220 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 5, flight: { std: 220 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 5, flight: { std: 1150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 830 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 5, flight: { std: 830 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 870 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 5, flight: { std: 870 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 105 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 5, flight: { std: 105 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 290 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 290 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 680 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 680 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 170 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 5, flight: { std: 170 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 935 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 445 }, day: 5, flight: { std: 935 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000397', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 5, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 125 }, day: 5, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000851', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1320 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 165 }, day: 5, flight: { std: 1320 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000937', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 5, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001070', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1040 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 5, flight: { std: 1040 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001353', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 405 }, day: 5, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000397' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 5, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000851' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 5, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000937' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1215 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 5, flight: { std: 1215 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000937' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 165 }, day: 5, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001070' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 765 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 5, flight: { std: 765 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 5, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 225 }, day: 5, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004007' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005545' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 5, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 555 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 5, flight: { std: 555 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 630 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 630 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 675 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 675 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 240 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 165 }, day: 5, flight: { std: 240 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008838' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 210 }, day: 5, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004007', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005545', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 195 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 165 }, day: 5, flight: { std: 195 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006248', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 755 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 5, flight: { std: 755 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 440 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 5, flight: { std: 440 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 30 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 5, flight: { std: 30 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 890 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 5, flight: { std: 890 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 865 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 5, flight: { std: 865 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001353' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 510 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 510 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 80 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 80 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 580 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 5, flight: { std: 580 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 5, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 465 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 5, flight: { std: 465 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008838', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 140 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 5, flight: { std: 140 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 250 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 200 }, day: 5, flight: { std: 250 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000003969' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 5, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006443' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 495 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 5, flight: { std: 495 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 555 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 5, flight: { std: 555 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000003969', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 915 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 5, flight: { std: 915 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006443', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 5, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 910 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 910 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 390 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 5, flight: { std: 390 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 60 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 5, flight: { std: 60 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 750 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 5, flight: { std: 750 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001849', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 415 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 50 }, day: 5, flight: { std: 415 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 605 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 5, flight: { std: 605 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 905 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 5, flight: { std: 905 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000003603', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 410 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 5, flight: { std: 410 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004847', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 690 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 5, flight: { std: 690 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 65 }, day: 5, flight: { std: 150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 825 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 5, flight: { std: 825 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 90 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 5, flight: { std: 90 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000007677', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 255 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 5, flight: { std: 255 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 510 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 5, flight: { std: 510 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000001855' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 495 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 5, flight: { std: 495 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 5, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 630 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 5, flight: { std: 630 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001849' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 280 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 5, flight: { std: 280 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001855' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 765 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 5, flight: { std: 765 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000003603' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 290 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 5, flight: { std: 290 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004847' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 780 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 5, flight: { std: 780 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008669' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 520 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 5, flight: { std: 520 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009181' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 115 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 115 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009183' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 230 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 5, flight: { std: 230 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009227' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 5, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008669', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 390 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 5, flight: { std: 390 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009174', arrivalAirportId: '7092901520000009183' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 5, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009181', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 495 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 495 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009183', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 285 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 5, flight: { std: 285 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009183', arrivalAirportId: '7092901520000009174' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 365 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 5, flight: { std: 365 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009227', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 970 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 490 }, day: 5, flight: { std: 970 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000003099' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 130 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 345 }, day: 5, flight: { std: 130 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004755' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 5, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004781' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 470 }, day: 5, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005013' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 135 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 365 }, day: 5, flight: { std: 135 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005045' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 315 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 315 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 680 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 200 }, day: 5, flight: { std: 680 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000004781' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 900 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 570 }, day: 5, flight: { std: 900 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000003099', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 575 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 325 }, day: 5, flight: { std: 575 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004755', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 970 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 130 }, day: 5, flight: { std: 970 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004781', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 410 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 5, flight: { std: 410 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004781', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 590 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 310 }, day: 5, flight: { std: 590 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005045', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 565 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 5, flight: { std: 565 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 910 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 570 }, day: 5, flight: { std: 910 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000010173', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 600 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 6, flight: { std: 600 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000350', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1065 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 6, flight: { std: 1065 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 760 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 6, flight: { std: 760 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 375 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 6, flight: { std: 375 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000000350' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 825 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 6, flight: { std: 825 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 0 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 6, flight: { std: 0 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006248' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 360 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 6, flight: { std: 360 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 735 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 6, flight: { std: 735 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 630 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 630 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 135 }, day: 6, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 90 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 6, flight: { std: 90 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 6, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006248', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 6, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 6, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 670 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 6, flight: { std: 670 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 6, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 6, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 555 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 6, flight: { std: 555 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 990 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 60 }, day: 6, flight: { std: 990 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 885 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 6, flight: { std: 885 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 200 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 6, flight: { std: 200 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 80 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 80 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 6, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1150 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 6, flight: { std: 1150 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 830 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 6, flight: { std: 830 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 880 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 6, flight: { std: 880 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 380 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 6, flight: { std: 380 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008123' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 6, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 700 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 6, flight: { std: 700 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 665 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 6, flight: { std: 665 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 935 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 445 }, day: 6, flight: { std: 935 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000397', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 6, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1320 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 165 }, day: 6, flight: { std: 1320 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000937', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 45 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 165 }, day: 6, flight: { std: 45 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000937', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 140 }, day: 6, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001070', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 285 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 6, flight: { std: 285 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001353', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 680 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 115 }, day: 6, flight: { std: 680 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001353', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 6, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000937' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 165 }, day: 6, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001070' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 975 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 390 }, day: 6, flight: { std: 975 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002937' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 180 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 225 }, day: 6, flight: { std: 180 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004007' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 290 }, day: 6, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005317' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 315 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 6, flight: { std: 315 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 810 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 6, flight: { std: 810 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 680 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 680 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005545' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1410 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 150 }, day: 6, flight: { std: 1410 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006248' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 510 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 510 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009171' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 680 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 6, flight: { std: 680 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009175' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 120 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 270 }, day: 6, flight: { std: 120 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000010175' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 6, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000001353' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 375 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 375 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 210 }, day: 6, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004007', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1195 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 320 }, day: 6, flight: { std: 1195 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005317', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 565 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 6, flight: { std: 565 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 6, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 840 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 840 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005545', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 755 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 95 }, day: 6, flight: { std: 755 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 525 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 6, flight: { std: 525 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 890 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 6, flight: { std: 890 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 500 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 6, flight: { std: 500 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001353' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 580 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 6, flight: { std: 580 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 675 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 675 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009171', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 830 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 6, flight: { std: 830 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009175', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 240 }, day: 6, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000010175', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 405 }, day: 6, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000397' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 140 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 6, flight: { std: 140 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 765 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 6, flight: { std: 765 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 195 }, day: 6, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 120 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 270 }, day: 6, flight: { std: 120 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002059' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 6, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006443' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 495 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 6, flight: { std: 495 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 6, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 555 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 180 }, day: 6, flight: { std: 555 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 490 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 240 }, day: 6, flight: { std: 490 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002059', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 915 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 480 }, day: 6, flight: { std: 915 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006443', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 705 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 705 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 6, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 510 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 510 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 910 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 910 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1090 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 6, flight: { std: 1090 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 345 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 6, flight: { std: 345 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001849', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 750 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 6, flight: { std: 750 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001849', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 360 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 360 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 395 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 6, flight: { std: 395 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000004847', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 870 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 870 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 540 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 6, flight: { std: 540 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000006305' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 870 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 6, flight: { std: 870 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 675 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 6, flight: { std: 675 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1080 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 6, flight: { std: 1080 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 440 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 85 }, day: 6, flight: { std: 440 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 965 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 65 }, day: 6, flight: { std: 965 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1060 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 70 }, day: 6, flight: { std: 1060 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 225 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 6, flight: { std: 225 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001849' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 630 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 6, flight: { std: 630 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001849' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1035 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 6, flight: { std: 1035 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000003603' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 270 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 6, flight: { std: 270 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004847' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 710 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 100 }, day: 6, flight: { std: 710 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 90 }, day: 6, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 300 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 6, flight: { std: 300 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 490 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 110 }, day: 6, flight: { std: 490 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008669' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 190 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 6, flight: { std: 190 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009180' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 520 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 6, flight: { std: 520 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009181' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 795 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 6, flight: { std: 795 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009473' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 450 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 6, flight: { std: 450 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000010170' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 660 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 125 }, day: 6, flight: { std: 660 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000008669', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 310 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 80 }, day: 6, flight: { std: 310 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009180', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 645 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 6, flight: { std: 645 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009181', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 915 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 75 }, day: 6, flight: { std: 915 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000009473', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 600 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 105 }, day: 6, flight: { std: 600 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000010170', arrivalAirportId: '7092901520000008191' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 570 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 270 }, day: 6, flight: { std: 570 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001126', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 165 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 300 }, day: 6, flight: { std: 165 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001126' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1050 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 495 }, day: 6, flight: { std: 1050 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000003099' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 1020 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 470 }, day: 6, flight: { std: 1020 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005013' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 135 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 365 }, day: 6, flight: { std: 135 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005045' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 210 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 6, flight: { std: 210 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 900 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 570 }, day: 6, flight: { std: 900 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000003099', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 930 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 530 }, day: 6, flight: { std: 930 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005013', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 590 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 310 }, day: 6, flight: { std: 590 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005045', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
  flight.push(
    new Flight(
      { std: 480 } as FlightModel,
      new WeekdayFlightRequirement(
        { scope: { blockTime: 120 }, day: 6, flight: { std: 480 } } as WeekdayFlightRequirementModel,
        new FlightRequirement({
          definition: { departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' } as FlightDefinitionModel
        } as FlightRequirementModel)
      )
    )
  );
}
