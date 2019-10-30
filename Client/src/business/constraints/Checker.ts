import Id from '@core/types/Id';
import { Constraint, ConstraintTemplate } from '@core/master-data';
import Preplan from 'src/business/preplan/Preplan';
import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import Objectionable from 'src/business/constraints/Objectionable';

export default abstract class Checker {
  readonly derivedId: Id;

  private objections!: Objection[];

  protected constructor(
    protected readonly preplan: Preplan,
    protected readonly constraintSystem: ConstraintSystem,
    readonly constraintTemplate: ConstraintTemplate,
    readonly constraint?: Constraint
  ) {
    this.derivedId = constraint ? `${constraintTemplate.id}-${constraint.id}` : constraintTemplate.id;
  }

  abstract check(): void;

  issueObjection(target: Objectionable, type: ObjectionType, priority: number, messageProvider: (constraintMarker: string) => string): void {
    this.objections.push(target.issueObjection(type, priority, this, messageProvider));
  }
  makeObjections(): Objection[] {
    this.objections = [];
    this.check();
    return this.objections;
  }
}
