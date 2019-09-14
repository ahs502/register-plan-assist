import { Constraint } from '@core/master-data';
import ConstraintTemplate from '@core/master-data/ConstraintTemplate';
import Preplan from 'src/business/Preplan';
import Objection from './Objection';

export default abstract class Checker {
  readonly derivedId: string;

  protected constructor(private readonly preplan: Preplan, readonly constraintTemplate: ConstraintTemplate, readonly constraint?: Constraint) {
    this.derivedId = constraint ? `${constraintTemplate.id}-${constraint.id}` : constraintTemplate.id;
  }

  static createFromNonInstantiableConstraintTemplate(preplan: Preplan, constraintTemplate: ConstraintTemplate): Checker {
    throw 'Not implemented.';
  }
  static createFromConstraint(preplan: Preplan, constraint: Constraint): Checker {
    throw 'Not implemented.';
  }

  abstract check(): Objection[];
}
