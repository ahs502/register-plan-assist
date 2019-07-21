import { Constraint as MasterDataConstraint } from '@core/master-data';
import Constraint from 'src/view-models/constraints/Constraint';
import ConstraintTemplate from 'src/view-models/constraints/ConstraintTemplate';
import Preplan from 'src/view-models/Preplan';

export default class ObjectionSystem {
  readonly constraints: readonly Constraint[];
  readonly preplan: Preplan;

  constructor(masterDataConstraints: readonly MasterDataConstraint[], preplan: Preplan) {
    this.constraints = ConstraintTemplate.instantiateAll(masterDataConstraints);
    this.preplan = preplan;

    // validate preplan completely here.
  }
}
