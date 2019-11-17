import Daytime from '@core/types/Daytime';
import DayFlightRequirementLegModel from '@core/models/flight-requirement/DayFlightRequirementLegModel';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import Id from '@core/types/Id';
import FlightRequirementLeg from 'src/business/flight-requirement/FlightRequirementLeg';

export default class DayFlightRequirementLeg {
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
}
