import Constraint from './Constraint';
import ConstraintTemplate from 'src/view-models/objections/ConstraintTemplate';

export default class NoConflictionOnFlightsConstraint extends Constraint {
  constructor() {
    super(ConstraintTemplate.all.NO_CONFLICTION_IN_FLIGHTS, ConstraintTemplate.all.NO_CONFLICTION_IN_FLIGHTS.name, ConstraintTemplate.all.NO_CONFLICTION_IN_FLIGHTS.description[0]);
  }
}
