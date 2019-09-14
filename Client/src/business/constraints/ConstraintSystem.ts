import Preplan from 'src/business/Preplan';
import Checker from './Checker';
import Objection from './Objection';
import MasterData from '@core/master-data';

export default class ConstraintSystem {
  readonly checkers: readonly Checker[];
  readonly objections: readonly Objection[];

  constructor(readonly preplan: Preplan) {
    this.checkers = MasterData.all.constraintTemplates.items
      .filter(t => !t.instantiable)
      .map(t => Checker.createFromNonInstantiableConstraintTemplate(t))
      .concat(
        MasterData.all.constraints.items.filter(c => true /*TODO: See if the scope of this constraint overlaps the intended preplan */).map(c => Checker.createFromConstraint(c))
      );

    this.objections = []; //TODO: Now, initially, calculate all existing objections...
  }
}
