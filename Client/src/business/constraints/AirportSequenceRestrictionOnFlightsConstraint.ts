import Constraint from './Constraint';
import ConstraintTemplate from 'src/business/constraints/ConstraintTemplate';

export default class AirportSequenceRestrictionOnFlightsConstraint extends Constraint {
  constructor() {
    super(
      ConstraintTemplate.all.AIRPORT_SEQUENCE_RESTRICTION_ON_FLIGHTS,
      ConstraintTemplate.all.AIRPORT_SEQUENCE_RESTRICTION_ON_FLIGHTS.name,
      ConstraintTemplate.all.AIRPORT_SEQUENCE_RESTRICTION_ON_FLIGHTS.description[0]
    );
  }
}
