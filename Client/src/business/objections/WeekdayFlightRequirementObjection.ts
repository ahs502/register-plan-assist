import Objection, { ObjectionType } from './Objection';
import Constraint from 'src/business/constraints/Constraint';
import WeekdayFlightRequirement from 'src/business/flights/WeekdayFlightRequirement';
import Weekday from '@core/types/Weekday';

export default class WeekdayFlightRequirementObjection extends Objection {
  readonly weekdayFlightRequirement: WeekdayFlightRequirement;

  constructor(
    type: ObjectionType,
    priority: number,
    constraint: Constraint,
    weekdayFlightRequirement: WeekdayFlightRequirement,
    messageProvider: (constraintMarker: string, weekdayFlightRequirementMarker: string) => string
  ) {
    super(type, priority + 200, constraint, constraintMarker =>
      messageProvider(
        constraintMarker,
        `flight requirement ${weekdayFlightRequirement.definition.label} from ${weekdayFlightRequirement.definition.departureAirport.name} to ${
          weekdayFlightRequirement.definition.arrivalAirport.name
        } on ${Weekday[weekdayFlightRequirement.day]}s`
      )
    );
    this.weekdayFlightRequirement = weekdayFlightRequirement;
  }
}
