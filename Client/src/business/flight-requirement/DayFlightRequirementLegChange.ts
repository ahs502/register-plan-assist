import ModelConvertable from 'src/business/ModelConvertable';
import DayFlightRequirementLegChangeModel from '@core/models/flight-requirement/DayFlightRequirementLegChangeModel';
import Daytime from '@core/types/Daytime';
import { dataTypes } from 'src/utils/DataType';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import FlightRequirementLeg from 'src/business/flight-requirement/FlightRequirementLeg';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import DayFlightRequirementChange from 'src/business/flight-requirement/DayFlightRequirementChange';
import FlightRequirementLegChange from 'src/business/flight-requirement/FlightRequirementLegChange';
import FlightRequirementChange from 'src/business/flight-requirement/FlightRequirementChange';
import DayFlightRequirementLeg from 'src/business/flight-requirement/DayFlightRequirementLeg';

export default class DayFlightRequirementLegChange implements ModelConvertable<DayFlightRequirementLegChangeModel> {
  readonly blockTime: Daytime;
  readonly stdLowerBound: Daytime;
  readonly stdUpperBound?: Daytime;
  readonly actualStdLowerBound: Daytime;
  readonly actualStdUpperBound: Daytime;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;

  constructor(
    raw: DayFlightRequirementLegChangeModel,
    readonly index: number,
    readonly dayOffset: number,
    readonly flightRequirement: FlightRequirement,
    readonly flightRequirementChange: FlightRequirementChange,
    readonly flightRequirementLeg: FlightRequirementLeg,
    readonly flightRequirementLegChange: FlightRequirementLegChange,
    readonly dayFlightRequirement: DayFlightRequirement,
    readonly dayFlightRequirementChange: DayFlightRequirementChange,
    readonly dayFlightRequirementLeg: DayFlightRequirementLeg
  ) {
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
  }

  extractModel(override?: (dayFlightRequirementLegChangeModel: DayFlightRequirementLegChangeModel) => DayFlightRequirementLegChangeModel): DayFlightRequirementLegChangeModel {
    const dayFlightRequirementLegChangeModel: DayFlightRequirementLegChangeModel = {
      blockTime: dataTypes.daytime.convertBusinessToModel(this.blockTime),
      stdLowerBound: dataTypes.daytime.convertBusinessToModel(this.stdLowerBound),
      stdUpperBound: dataTypes.daytime.convertBusinessToModelOptional(this.stdUpperBound),
      originPermission: this.originPermission,
      destinationPermission: this.destinationPermission
    };
    return override?.(dayFlightRequirementLegChangeModel) ?? dayFlightRequirementLegChangeModel;
  }
}
