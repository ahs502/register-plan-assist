import Constraint from './Constraint';
import ConstraintTemplate from 'src/business/constraints/ConstraintTemplate';

export default class MinimumGroundTimeBetweenFlightsConstraint extends Constraint {
  constructor() {
    super(
      ConstraintTemplate.all.MINIMUM_GROUND_TIME_BETWEEN_FLIGHTS,
      ConstraintTemplate.all.MINIMUM_GROUND_TIME_BETWEEN_FLIGHTS.name,
      ConstraintTemplate.all.MINIMUM_GROUND_TIME_BETWEEN_FLIGHTS.description[0]
    );
  }
}
