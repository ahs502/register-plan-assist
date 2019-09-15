import Checker from 'src/business/constraints/Checker';
import Objection from 'src/business/constraints/Objection';
import Preplan from 'src/business/Preplan';
import { Constraint } from '@core/master-data';

export default class AirportAllocationPriorityForAircraftsChecker extends Checker {
  constructor(preplan: Preplan, constraint: Constraint) {
    super(preplan, constraint.template, constraint);
  }

  check(): Objection[] {
    throw 'Not implemented.';
  }
}
