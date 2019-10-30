import ModelConvertable, { getOverrided } from 'src/business/ModelConvertable';
import Daytime from '@core/types/Daytime';
import DayFlightRequirementLegModel from '@core/models/flight-requirement/DayFlightRequirementLegModel';
import DeepWritablePartial from '@core/types/DeepWritablePartial';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import Id from '@core/types/Id';
import FlightRequirementLeg from 'src/business/flight-requirement/FlightRequirementLeg';

export default class DayFlightRequirementLeg implements ModelConvertable<DayFlightRequirementLegModel> {
  readonly derivedId: Id;
  readonly blockTime: number;
  readonly stdLowerBound: Daytime;
  readonly stdUpperBound?: Daytime;
  readonly actualStdLowerBound: Daytime;
  readonly actualStdUpperBound: Daytime;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;

  constructor(
    raw: DayFlightRequirementLegModel,
    readonly index: number,
    readonly dayOffset: number,
    readonly flightRequirement: FlightRequirement,
    readonly flightRequirementLeg: FlightRequirementLeg,
    readonly dayFlightRequirement: DayFlightRequirement
  ) {
    this.derivedId = `${dayFlightRequirement.derivedId}#${index}`;
    this.blockTime = raw.blockTime;
    this.stdLowerBound = new Daytime(raw.stdLowerBound);
    this.stdUpperBound = raw.stdUpperBound === undefined ? undefined : new Daytime(raw.stdUpperBound);
    this.actualStdLowerBound = new Daytime(raw.stdLowerBound + dayOffset * 24 * 60);
    let actualStdUpperBoundMinutes = (raw.stdUpperBound === undefined ? raw.stdLowerBound : raw.stdUpperBound) + dayOffset * 24 * 60;
    while (actualStdUpperBoundMinutes < this.actualStdLowerBound.minutes) {
      actualStdUpperBoundMinutes += 24 * 60;
    }
    this.actualStdUpperBound = new Daytime(actualStdUpperBoundMinutes);
    this.originPermission = raw.originPermission;
    this.destinationPermission = raw.destinationPermission;
  }

  extractModel(overrides?: DeepWritablePartial<DayFlightRequirementLegModel>): DayFlightRequirementLegModel {
    return {
      blockTime: getOverrided(this.blockTime, overrides, 'blockTime'),
      stdLowerBound: getOverrided(this.stdLowerBound.minutes, overrides, 'stdLowerBound'),
      stdUpperBound: getOverrided(this.stdUpperBound === undefined ? undefined : this.stdUpperBound.minutes, overrides, 'stdUpperBound'),
      originPermission: getOverrided(this.originPermission, overrides, 'originPermission'),
      destinationPermission: getOverrided(this.destinationPermission, overrides, 'destinationPermission')
    };
  }
}
