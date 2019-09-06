import { Constraint as MasterDataConstraint } from '@core/master-data';
import Constraint from 'src/business/constraints/Constraint';
import ConstraintTemplate from 'src/business/constraints/ConstraintTemplate';
import Preplan from 'src/business/Preplan';

export default class ObjectionSystem {
  readonly constraints: readonly Constraint[];
  readonly preplan: Preplan;

  constructor(masterDataConstraints: readonly MasterDataConstraint[], preplan: Preplan) {
    this.constraints = ConstraintTemplate.instantiateAll(masterDataConstraints);
    this.preplan = preplan;

    // validate preplan completely here.
  }
}
