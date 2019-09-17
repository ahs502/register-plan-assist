import { Constraint, ConstraintTemplate } from '@core/master-data';
import Preplan from 'src/business/Preplan';
import ConstraintSystem from './ConstraintSystem';
import Objection from './Objection';

export default abstract class Checker {
  readonly derivedId: string;

  protected constructor(
    protected readonly preplan: Preplan,
    protected readonly constraintSystem: ConstraintSystem,
    readonly constraintTemplate: ConstraintTemplate,
    readonly constraint?: Constraint
  ) {
    this.derivedId = constraint ? `${constraintTemplate.id}-${constraint.id}` : constraintTemplate.id;
  }

  abstract check(): Objection[];
}
