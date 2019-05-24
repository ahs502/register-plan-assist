import IClonable from './IClonable';
import Airport from './master-data/Airport';
import MasterData from './master-data';

/**
 * Describes the headline definitions of a flight.
 */
export default class FlightDefinition implements IClonable<FlightDefinition> {
  label: string;
  flightNumber: string;
  departureAirportId: string;
  arrivalAirportId: string;

  constructor(label: string, flightNumber: string, departureAirportId: string, arrivalAirportId: string) {
    this.label = label;
    this.flightNumber = flightNumber;
    this.departureAirportId = departureAirportId;
    this.arrivalAirportId = arrivalAirportId;
  }

  clone(): FlightDefinition {
    return new FlightDefinition(this.label, this.flightNumber, this.departureAirportId, this.arrivalAirportId);
  }

  getDepartureAirport(): Airport {
    return MasterData.all.airports.id[this.departureAirportId];
  }
  getArrivalAirport(): Airport {
    return MasterData.all.airports.id[this.arrivalAirportId];
  }
}
