import Preplan from 'src/business/Preplan';
import Checker from './Checker';
import Objection from './Objection';
import MasterData from '@core/master-data';

export interface ObjectionDiff {
  introduced: Objection[];
  resolved: Objection[];
  modified: Objection[];
}

export default class ConstraintSystem {
  readonly checkers: readonly Checker[];
  readonly objections: readonly Objection[];
  private stagedObjections: readonly Objection[];

  constructor(readonly preplan: Preplan) {
    this.checkers = MasterData.all.constraintTemplates.items
      .filter(t => !t.instantiable)
      .map(t => Checker.createFromNonInstantiableConstraintTemplate(preplan, t))
      .concat(
        MasterData.all.constraints.items
          .filter(c => true /*TODO: See if the scope of this constraint overlaps the intended preplan */)
          .map(c => Checker.createFromConstraint(preplan, c))
      );
    this.objections = this.check();
    this.stagedObjections = [];
  }

  private check(): Objection[] {
    return this.checkers.flatMap(checker => checker.check()).sortBy('priority', 'message');
  }

  stage(): ObjectionDiff {
    this.stagedObjections = this.check();
    const introduced: Objection[] = [];
    const modified: Objection[] = [];
    this.stagedObjections.forEach(s => {
      const o = this.objections.find(objection => objection.match(s));
      if (!o) return introduced.push(s);
      if (o.message === s.message) return;
      modified.push(s);
    });
    const resolved = this.objections.filter(o => !this.stagedObjections.some(s => o.match(s)));
    return { introduced, resolved, modified };
  }
  commit(): void {
    (this as { objections: readonly Objection[] }).objections = this.stagedObjections;
  }
}
