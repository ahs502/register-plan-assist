import Daytime from '@core/types/Daytime';
import ModelConvertable from 'src/business/ModelConvertable';
import { dataTypes } from 'src/utils/DataType';
import FlightRequirementLegChangeModel from '@core/models/flight-requirement/FlightRequirementLegChangeModel';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import FlightRequirementChange from 'src/business/flight-requirement/FlightRequirementChange';

export default class FlightRequirementLegChange implements ModelConvertable<FlightRequirementLegChangeModel> {
  readonly blockTime: Daytime;
  readonly stdLowerBound: Daytime;
  readonly stdUpperBound?: Daytime;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;

  constructor(
    raw: FlightRequirementLegChangeModel,
    readonly index: number,
    readonly flightRequirement: FlightRequirement,
    readonly flightRequirementChange: FlightRequirementChange
  ) {
    this.blockTime = dataTypes.daytime.convertModelToBusiness(raw.blockTime);
    this.stdLowerBound = dataTypes.daytime.convertModelToBusiness(raw.stdLowerBound);
    this.stdUpperBound = dataTypes.daytime.convertModelToBusinessOptional(raw.stdUpperBound);
    this.originPermission = raw.originPermission;
    this.destinationPermission = raw.destinationPermission;
  }

  extractModel(override?: (flightRequirementLegChangeModel: FlightRequirementLegChangeModel) => FlightRequirementLegChangeModel): FlightRequirementLegChangeModel {
    const flightRequirementLegChangeModel: FlightRequirementLegChangeModel = {
      blockTime: dataTypes.daytime.convertBusinessToModel(this.blockTime),
      stdLowerBound: dataTypes.daytime.convertBusinessToModel(this.stdLowerBound),
      stdUpperBound: dataTypes.daytime.convertBusinessToModelOptional(this.stdUpperBound),
      originPermission: this.originPermission,
      destinationPermission: this.destinationPermission
    };
    return override?.(flightRequirementLegChangeModel) ?? flightRequirementLegChangeModel;
  }
}
