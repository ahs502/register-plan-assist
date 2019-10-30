import ModelConvertable, { getOverrided } from 'src/business/ModelConvertable';
import FlightRequirementLegModel from '@core/models/flight-requirement/FlightRequirementLegModel';
import MasterData, { Airport } from '@core/master-data';
import Daytime from '@core/types/Daytime';
import FlightNumber from '@core/types/FlightNumber';
import DeepWritablePartial from '@core/types/DeepWritablePartial';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Id from '@core/types/Id';

export default class FlightRequirementLeg implements ModelConvertable<FlightRequirementLegModel> {
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

  extractModel(overrides?: DeepWritablePartial<FlightRequirementLegModel>): FlightRequirementLegModel {
    return {
      flightNumber: getOverrided(this.flightNumber.standardFormat, overrides, 'flightNumber'),
      departureAirportId: getOverrided(this.departureAirport.id, overrides, 'departureAirportId'),
      arrivalAirportId: getOverrided(this.arrivalAirport.id, overrides, 'arrivalAirportId'),
      blockTime: getOverrided(this.blockTime, overrides, 'blockTime'),
      stdLowerBound: getOverrided(this.stdLowerBound.minutes, overrides, 'stdLowerBound'),
      stdUpperBound: getOverrided(this.stdUpperBound === undefined ? undefined : this.stdUpperBound.minutes, overrides, 'stdUpperBound'),
      originPermission: getOverrided(this.originPermission, overrides, 'originPermission'),
      destinationPermission: getOverrided(this.destinationPermission, overrides, 'destinationPermission')
    };
  }
}
