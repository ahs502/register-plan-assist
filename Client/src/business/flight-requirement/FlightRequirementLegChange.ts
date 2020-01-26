import Daytime from '@core/types/Daytime';
import ModelConvertable from 'src/business/ModelConvertable';
import { dataTypes } from 'src/utils/DataType';
import FlightRequirementLegChangeModel from '@core/models/flight-requirement/FlightRequirementLegChangeModel';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import FlightRequirementChange from 'src/business/flight-requirement/FlightRequirementChange';
import FlightRequirementLeg from 'src/business/flight-requirement/FlightRequirementLeg';

export default class FlightRequirementLegChange implements ModelConvertable<FlightRequirementLegChangeModel> {
  readonly blockTime: Daytime;
  readonly stdLowerBound: Daytime;
  readonly stdUpperBound?: Daytime;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;
  readonly originPermissionNote: string;
  readonly destinationPermissionNote: string;

  constructor(
    raw: FlightRequirementLegChangeModel,
    readonly index: number,
    readonly flightRequirement: FlightRequirement,
    readonly flightRequirementChange: FlightRequirementChange,
    readonly flightRequirementLeg: FlightRequirementLeg
  ) {
    this.blockTime = dataTypes.daytime.convertModelToBusiness(raw.blockTime);
    this.stdLowerBound = dataTypes.daytime.convertModelToBusiness(raw.stdLowerBound);
    this.stdUpperBound = dataTypes.daytime.convertModelToBusinessOptional(raw.stdUpperBound);
    this.originPermission = raw.originPermission;
    this.destinationPermission = raw.destinationPermission;
    this.originPermissionNote = raw.originPermissionNote;
    this.destinationPermissionNote = raw.destinationPermissionNote;
  }

  extractModel(override?: (flightRequirementLegChangeModel: FlightRequirementLegChangeModel) => FlightRequirementLegChangeModel): FlightRequirementLegChangeModel {
    const flightRequirementLegChangeModel: FlightRequirementLegChangeModel = {
      blockTime: dataTypes.daytime.convertBusinessToModel(this.blockTime),
      stdLowerBound: dataTypes.daytime.convertBusinessToModel(this.stdLowerBound),
      stdUpperBound: dataTypes.daytime.convertBusinessToModelOptional(this.stdUpperBound),
      originPermission: this.originPermission,
      destinationPermission: this.destinationPermission,
      originPermissionNote: this.originPermissionNote,
      destinationPermissionNote: this.destinationPermissionNote
    };
    return override?.(flightRequirementLegChangeModel) ?? flightRequirementLegChangeModel;
  }
}
