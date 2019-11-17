import FlightRequirementLegModel from '@core/models/flight-requirement/FlightRequirementLegModel';
import MasterData, { Airport } from '@core/master-data';
import Daytime from '@core/types/Daytime';
import FlightNumber from '@core/types/FlightNumber';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Id from '@core/types/Id';

export default class FlightRequirementLeg {
  readonly derivedId: Id;
  readonly flightNumber: FlightNumber;
  readonly departureAirport: Airport;
  readonly arrivalAirport: Airport;
  readonly blockTime: number;
  readonly stdLowerBound: Daytime;
  readonly stdUpperBound?: Daytime;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;

  constructor(raw: FlightRequirementLegModel, readonly index: number, readonly flightRequirement: FlightRequirement) {
    this.derivedId = `${flightRequirement.id}#${index}`;
    this.flightNumber = new FlightNumber(raw.flightNumber);
    this.departureAirport = MasterData.all.airports.id[raw.departureAirportId];
    this.arrivalAirport = MasterData.all.airports.id[raw.arrivalAirportId];
    this.blockTime = raw.blockTime;
    this.stdLowerBound = new Daytime(raw.stdLowerBound);
    this.stdUpperBound = raw.stdUpperBound === undefined ? undefined : new Daytime(raw.stdUpperBound);
    this.originPermission = raw.originPermission;
    this.destinationPermission = raw.destinationPermission;
  }
}
