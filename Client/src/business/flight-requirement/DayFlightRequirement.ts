import DayFlightRequirementModel from '@core/models/flight-requirement/DayFlightRequirementModel';
import Rsx from '@core/types/Rsx';
import Objectionable from 'src/business/constraints/Objectionable';
import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Weekday from '@core/types/Weekday';
import Checker from 'src/business/constraints/Checker';
import Id from '@core/types/Id';
import PreplanAircraftSelection from 'src/business/preplan/PreplanAircraftSelection';
import DayFlightRequirementLeg from 'src/business/flight-requirement/DayFlightRequirementLeg';
import { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';

export default class DayFlightRequirement implements Objectionable {
  readonly derivedId: Id;
  readonly aircraftSelection: PreplanAircraftSelection;
  readonly rsx: Rsx;
  readonly day: Weekday;
  readonly notes: string;
  readonly route: readonly DayFlightRequirementLeg[];

  constructor(raw: DayFlightRequirementModel, aircraftRegisters: PreplanAircraftRegisters, readonly flightRequirement: FlightRequirement) {
    this.derivedId = `${flightRequirement.id}-${raw.day}`;
    this.aircraftSelection = new PreplanAircraftSelection(raw.aircraftSelection, aircraftRegisters);
    this.rsx = raw.rsx;
    this.day = raw.day;
    this.notes = raw.notes;

    let dayOffset = 0;
    let previousStaLowerBound = Number.NEGATIVE_INFINITY;
    const route: DayFlightRequirementLeg[] = (this.route = []);
    raw.route.forEach((leg, index) => {
      let stdLowerBound = leg.stdLowerBound + dayOffset * 24 * 60;
      let stdUpperBound = (leg.stdUpperBound === undefined ? leg.stdLowerBound : leg.stdUpperBound) + dayOffset * 24 * 60;
      while (stdUpperBound < stdLowerBound) {
        stdUpperBound += 24 * 60;
      }
      while (stdUpperBound <= previousStaLowerBound) {
        dayOffset++;
        stdLowerBound += 24 * 60;
        stdUpperBound += 24 * 60;
      }
      route.push(new DayFlightRequirementLeg(leg, index, dayOffset, flightRequirement, flightRequirement.route[index], this));
      previousStaLowerBound = stdLowerBound + leg.blockTime;
    });
  }

  get marker(): string {
    return `flight requirement ${this.flightRequirement.label} on ${Weekday[this.day]}s`;
  }
  issueObjection(type: ObjectionType, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string): Objection<DayFlightRequirement> {
    return new Objection<DayFlightRequirement>(type, this, 3, priority, checker, messageProvider);
  }
}
