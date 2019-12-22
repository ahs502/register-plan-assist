import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/preplan/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { Constraint } from 'src/business/master-data';
import { AirportRestrictionOnAircraftsConstraintData } from 'src/business/master-data/Constraint';

export default class AirportRestrictionOnAircraftsChecker extends Checker {
  private data: AirportRestrictionOnAircraftsConstraintData;

  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraint: Constraint) {
    super(preplan, constraintSystem, constraint.template, constraint);
    this.data = constraint.data as AirportRestrictionOnAircraftsConstraintData;
  }

  check(): void {
    //TODO: Not implemented.
  }
}
