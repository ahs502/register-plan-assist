import Constraint from './Constraint';
import ConstraintTemplate from 'src/view-models/objections/ConstraintTemplate';

export default class ValidPeriodCheckOnAircraftsConstraint extends Constraint {
  constructor() {
    super(
      ConstraintTemplate.all.VALID_PERIOD_CHECK_ON_AIRCRAFTS,
      ConstraintTemplate.all.VALID_PERIOD_CHECK_ON_AIRCRAFTS.name,
      ConstraintTemplate.all.VALID_PERIOD_CHECK_ON_AIRCRAFTS.description[0]
    );
  }
}
