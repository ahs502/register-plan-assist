import MasterDataItem, { MasterDataItems, MasterDataItemModel } from './MasterDataItem';

export interface ConstraintModel extends MasterDataItemModel {}

export default class Constraint extends MasterDataItem implements ConstraintModel {
  constructor(raw: ConstraintModel) {
    super(raw);
  }
}

export class Constraints extends MasterDataItems<Constraint> {
  static parse(raw: ConstraintModel[]): Constraints | undefined {
    if (!raw) return undefined;
    return new Constraints(raw.map(x => new Constraint(x)));
  }
}
