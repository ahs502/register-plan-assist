import MasterData, { Stc, Airport } from '@core/master-data';
import FlightDefinitionModel from '@core/models/flights/FlightDefinitionModel';

export default class FlightDefinition {
  readonly label: string;
  readonly category: string;
  readonly stc: Stc;
  readonly flightNumber: string;
  readonly departureAirport: Airport;
  readonly arrivalAirport: Airport;

  constructor(raw: FlightDefinitionModel) {
    this.label = raw.label;
    this.category = raw.category;
    this.stc = MasterData.all.stcs.id[raw.stcId];
    this.flightNumber = raw.flightNumber;
    this.departureAirport = MasterData.all.airports.id[raw.departureAirportId];
    this.arrivalAirport = MasterData.all.airports.id[raw.arrivalAirportId];
  }
}
