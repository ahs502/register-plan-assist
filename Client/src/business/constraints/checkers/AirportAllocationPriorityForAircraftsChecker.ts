import Checker from 'src/business/constraints/Checker';
import Objection from 'src/business/constraints/Objection';
import Preplan from 'src/business/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { Constraint } from '@core/master-data';

export default class AirportAllocationPriorityForAircraftsChecker extends Checker {
  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraint: Constraint) {
    super(preplan, constraintSystem, constraint.template, constraint);
  }

  check(): Objection[] {
    throw 'Not implemented.';
  }
}
