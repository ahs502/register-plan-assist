import MasterData, { Stc, Airport } from '@core/master-data';
import FlightDefinitionModel from '@core/models/flight/FlightDefinitionModel';

export default class FlightDefinition {
  readonly label: string;
  readonly stc: Stc;
  readonly flightNumber: string;
  readonly departureAirport: Airport;
  readonly arrivalAirport: Airport;

  constructor(raw: FlightDefinitionModel) {
    this.label = raw.label;
    this.stc = MasterData.all.stcs.id[raw.stcId];
    this.flightNumber = raw.flightNumber;
    this.departureAirport = MasterData.all.airports.id[raw.departureAirportId];
    this.arrivalAirport = MasterData.all.airports.id[raw.arrivalAirportId];
  }
}
