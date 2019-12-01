import FlightRequirementLegModel from '@core/models/flight-requirement/FlightRequirementLegModel';
import MasterData, { Airport } from '@core/master-data';
import Daytime from '@core/types/Daytime';
import FlightNumber from '@core/types/FlightNumber';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Id from '@core/types/Id';
import ModelConvertable from 'src/business/ModelConvertable';
import { dataTypes } from 'src/utils/DataType';

export default class FlightRequirementLeg implements ModelConvertable<FlightRequirementLegModel> {
  readonly derivedId: Id;
  readonly flightNumber: FlightNumber;
  readonly departureAirport: Airport;
  readonly arrivalAirport: Airport;
  readonly blockTime: Daytime;
  readonly stdLowerBound: Daytime;
  readonly stdUpperBound?: Daytime;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;

  constructor(raw: FlightRequirementLegModel, readonly index: number, readonly flightRequirement: FlightRequirement) {
    this.derivedId = `${flightRequirement.id}#${index}`;
    this.flightNumber = dataTypes.flightNumber.convertModelToBusiness(raw.flightNumber);
    this.departureAirport = dataTypes.airport.convertModelToBusiness(raw.departureAirportId);
    this.arrivalAirport = dataTypes.airport.convertModelToBusiness(raw.arrivalAirportId);
    this.blockTime = dataTypes.daytime.convertModelToBusiness(raw.blockTime);
    this.stdLowerBound = dataTypes.daytime.convertModelToBusiness(raw.stdLowerBound);
    this.stdUpperBound = dataTypes.daytime.convertModelToBusinessOptional(raw.stdUpperBound);
    this.originPermission = raw.originPermission;
    this.destinationPermission = raw.destinationPermission;
  }

  extractModel(override?: (flightRequirementLegModel: FlightRequirementLegModel) => FlightRequirementLegModel): FlightRequirementLegModel {
    const flightRequirementLegModel: FlightRequirementLegModel = {
      flightNumber: dataTypes.flightNumber.convertBusinessToModel(this.flightNumber),
      departureAirportId: dataTypes.airport.convertBusinessToModel(this.departureAirport),
      arrivalAirportId: dataTypes.airport.convertBusinessToModel(this.arrivalAirport),
      blockTime: dataTypes.daytime.convertBusinessToModel(this.blockTime),
      stdLowerBound: dataTypes.daytime.convertBusinessToModel(this.stdLowerBound),
      stdUpperBound: dataTypes.daytime.convertBusinessToModelOptional(this.stdUpperBound),
      originPermission: this.originPermission,
      destinationPermission: this.destinationPermission
    };
    return override?.(flightRequirementLegModel) ?? flightRequirementLegModel;
  }
}
