import Checker from 'src/business/constraints/Checker';
import Objection from 'src/business/constraints/Objection';
import Preplan from 'src/business/Preplan';
import { ConstraintTemplate } from '@core/master-data';

export default class ValidPeriodCheckOnAircraftsChecker extends Checker {
  constructor(preplan: Preplan, constraintTemplate: ConstraintTemplate) {
    super(preplan, constraintTemplate);
  }

  check(): Objection[] {
    throw 'Not implemented.';
  }
}
