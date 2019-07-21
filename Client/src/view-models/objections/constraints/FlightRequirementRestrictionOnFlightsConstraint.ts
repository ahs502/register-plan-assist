import Constraint from './Constraint';
import ConstraintTemplate from 'src/view-models/objections/ConstraintTemplate';

export default class FlightRequirementRestrictionOnFlightsConstraint extends Constraint {
  constructor() {
    super(
      ConstraintTemplate.all.FLIGHT_REQUIREMENT_RESTRICTION_ON_FLIGHTS,
      ConstraintTemplate.all.FLIGHT_REQUIREMENT_RESTRICTION_ON_FLIGHTS.name,
      ConstraintTemplate.all.FLIGHT_REQUIREMENT_RESTRICTION_ON_FLIGHTS.description[0]
    );
  }
}
