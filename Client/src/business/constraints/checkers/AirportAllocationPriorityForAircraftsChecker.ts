import Checker from 'src/business/constraints/Checker';
import Objection from 'src/business/constraints/Objection';
import Preplan from 'src/business/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { Constraint } from '@core/master-data';
import { AirportAllocationPriorityForAircraftsConstraintData } from '@core/master-data/Constraint';

export default class AirportAllocationPriorityForAircraftsChecker extends Checker {
  private data: AirportAllocationPriorityForAircraftsConstraintData;

  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraint: Constraint) {
    super(preplan, constraintSystem, constraint.template, constraint);
    this.data = constraint.data as AirportAllocationPriorityForAircraftsConstraintData;
  }

  check(): Objection[] {
    return []; //TODO: Not implemented.
  }
}
