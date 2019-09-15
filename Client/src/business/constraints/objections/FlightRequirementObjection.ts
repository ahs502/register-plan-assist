import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import Checker from 'src/business/constraints/Checker';
import FlightRequirement from 'src/business/flights/FlightRequirement';

export default class FlightRequirementObjection extends Objection {
  constructor(
    type: ObjectionType,
    priority: number,
    checker: Checker,
    readonly flightRequirement: FlightRequirement,
    messageProvider: (constraintMarker: string, flightRequirementMarker: string) => string
  ) {
    super(type, 'FLIGHT_REQUIREMENT', priority, checker, constraintMarker =>
      messageProvider(
        constraintMarker,
        `flight requirement ${flightRequirement.definition.label} number ${flightRequirement.definition.flightNumber} from ${flightRequirement.definition.departureAirport.name} to ${flightRequirement.definition.arrivalAirport.name}`
      )
    );
  }

  get targetId(): string {
    return this.flightRequirement.id;
  }
}
