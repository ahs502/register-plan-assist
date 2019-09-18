import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import Checker from 'src/business/constraints/Checker';
import WeekdayFlightRequirement from 'src/business/flights/WeekdayFlightRequirement';
import Weekday from '@core/types/Weekday';

export default class WeekdayFlightRequirementObjection extends Objection {
  constructor(
    type: ObjectionType,
    priority: number,
    checker: Checker,
    readonly weekdayFlightRequirement: WeekdayFlightRequirement,
    messageProvider: (constraintMarker: string, weekdayFlightRequirementMarker: string) => string
  ) {
    super(type, 'WEEKDAY_FLIGHT_REQUIREMENT', priority, checker, constraintMarker =>
      messageProvider(
        constraintMarker,
        `flight requirement ${weekdayFlightRequirement.definition.label} number ${weekdayFlightRequirement.definition.flightNumber} from ${
          weekdayFlightRequirement.definition.departureAirport.name
        } to ${weekdayFlightRequirement.definition.arrivalAirport.name} on ${Weekday[weekdayFlightRequirement.day]}s`
      )
    );
  }

  get targetId(): string {
    return this.weekdayFlightRequirement.derivedId;
  }
}
