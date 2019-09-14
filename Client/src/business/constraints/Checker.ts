import { Constraint } from '@core/master-data';
import ConstraintTemplate from '@core/master-data/ConstraintTemplate';

export default abstract class Checker {
  protected constructor(readonly constraintTemplate: ConstraintTemplate, readonly constraint?: Constraint) {}

  static createFromNonInstantiableConstraintTemplate(constraintTemplate: ConstraintTemplate): Checker {
    return 0 as any;
  }
  static createFromConstraint(constraint: Constraint): Checker {
    return 0 as any;
  }
}
