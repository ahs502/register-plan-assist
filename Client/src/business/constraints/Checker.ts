import { Constraint, ConstraintTemplate } from '@core/master-data';
import Preplan from 'src/business/Preplan';
import Objection from './Objection';

export default abstract class Checker {
  readonly derivedId: string;

  protected constructor(protected readonly preplan: Preplan, readonly constraintTemplate: ConstraintTemplate, readonly constraint?: Constraint) {
    this.derivedId = constraint ? `${constraintTemplate.id}-${constraint.id}` : constraintTemplate.id;
  }

  abstract check(): Objection[];
}
