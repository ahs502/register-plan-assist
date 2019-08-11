import Objection, { ObjectionType } from './Objection';
import Constraint from 'src/view-models/constraints/Constraint';
import FlightRequirement from 'src/view-models/flights/FlightRequirement';

export default class FlightRequirementObjection extends Objection {
  readonly flightRequirement: FlightRequirement;

  constructor(
    type: ObjectionType,
    priority: number,
    constraint: Constraint,
    flightRequirement: FlightRequirement,
    messageProvider: (constraintMarker: string, flightRequirementMarker: string) => string
  ) {
    super(type, priority + 300, constraint, constraintMarker =>
      messageProvider(
        constraintMarker,
        `flight requirement ${flightRequirement.definition.label} from ${flightRequirement.definition.departureAirport.name} to ${flightRequirement.definition.arrivalAirport.name}`
      )
    );
    this.flightRequirement = flightRequirement;
  }
}
