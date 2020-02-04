import Daytime from '@core/types/Daytime';
import DayFlightRequirementLegModel from '@core/models/flight-requirement/DayFlightRequirementLegModel';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import Id from '@core/types/Id';
import FlightRequirementLeg from 'src/business/flight-requirement/FlightRequirementLeg';
import ModelConvertable from 'src/business/ModelConvertable';
import { dataTypes } from 'src/utils/DataType';

export default class DayFlightRequirementLeg implements ModelConvertable<DayFlightRequirementLegModel> {
  readonly derivedId: Id;
  readonly blockTime: Daytime;
  readonly stdLowerBound: Daytime;
  readonly stdUpperBound?: Daytime;
  readonly actualStdLowerBound: Daytime;
  readonly actualStdUpperBound: Daytime;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;
  readonly originPermissionNote: string;
  readonly destinationPermissionNote: string;

  constructor(
    raw: DayFlightRequirementLegModel,
    readonly index: number,
    readonly dayOffset: number,
    readonly flightRequirement: FlightRequirement,
    readonly flightRequirementLeg: FlightRequirementLeg,
    readonly dayFlightRequirement: DayFlightRequirement
  ) {
    this.derivedId = `${dayFlightRequirement.derivedId}#${index}`;
    this.blockTime = dataTypes.daytime.convertModelToBusiness(raw.blockTime);
    this.stdLowerBound = dataTypes.daytime.convertModelToBusiness(raw.stdLowerBound);
    this.stdUpperBound = dataTypes.daytime.convertModelToBusinessOptional(raw.stdUpperBound);
    this.actualStdLowerBound = new Daytime(raw.stdLowerBound + dayOffset * 24 * 60);
    let actualStdUpperBoundMinutes = (raw.stdUpperBound === undefined ? raw.stdLowerBound : raw.stdUpperBound) + dayOffset * 24 * 60;
    while (actualStdUpperBoundMinutes < this.actualStdLowerBound.minutes) {
      actualStdUpperBoundMinutes += 24 * 60;
    }
    this.actualStdUpperBound = new Daytime(actualStdUpperBoundMinutes);
    this.originPermission = raw.originPermission;
    this.destinationPermission = raw.destinationPermission;
    this.originPermissionNote = raw.originPermissionNote;
    this.destinationPermissionNote = raw.destinationPermissionNote;
  }

  extractModel(override?: (dayFlightRequirementLegModel: DayFlightRequirementLegModel) => DayFlightRequirementLegModel): DayFlightRequirementLegModel {
    const dayFlightRequirementLegModel: DayFlightRequirementLegModel = {
      blockTime: dataTypes.daytime.convertBusinessToModel(this.blockTime),
      stdLowerBound: dataTypes.daytime.convertBusinessToModel(this.stdLowerBound),
      stdUpperBound: dataTypes.daytime.convertBusinessToModelOptional(this.stdUpperBound),
      originPermission: this.originPermission,
      destinationPermission: this.destinationPermission,
      originPermissionNote: this.originPermissionNote,
      destinationPermissionNote: this.destinationPermissionNote
    };
    return override?.(dayFlightRequirementLegModel) ?? dayFlightRequirementLegModel;
  }
}
