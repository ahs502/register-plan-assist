import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/preplan/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { Constraint } from '@core/master-data';
import { RouteSequenceRestrictionOnAirportsConstraintData } from '@core/master-data/Constraint';

export default class RouteSequenceRestrictionOnAirportsChecker extends Checker {
  private data: RouteSequenceRestrictionOnAirportsConstraintData;

  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraint: Constraint) {
    super(preplan, constraintSystem, constraint.template, constraint);
    this.data = constraint.data as RouteSequenceRestrictionOnAirportsConstraintData;
  }

  check(): void {
    //TODO: Not implemented.
  }
}
