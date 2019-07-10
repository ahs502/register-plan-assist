import ConstraintModel from '@core/models/master-data/ConstraintModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class Constraint extends MasterDataItem {
  constructor(raw: ConstraintModel) {
    super(raw, `description for ${raw.name}` /*TODO: Do something about this! */);
  }
}

export class Constraints extends MasterDataItems<Constraint> {
  static parse(raw?: readonly ConstraintModel[]): Constraints | undefined {
    if (!raw) return undefined;
    return new Constraints(raw.map(x => new Constraint(x)));
  }
}
