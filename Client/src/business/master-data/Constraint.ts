import MasterDataItem, { MasterDataItems, MasterDataItemModel } from './MasterDataItem';

export interface ConstraintModel extends MasterDataItemModel {}

export default class Constraint extends MasterDataItem implements ConstraintModel {
  readonly description: string;
  constructor(raw: ConstraintModel) {
    super(raw, `description for ${raw.name}` /*TODO: Do something about this! */);
    this.description = raw.name;
  }
}

export class Constraints extends MasterDataItems<Constraint> {
  static parse(raw?: ReadonlyArray<ConstraintModel>): Constraints | undefined {
    if (!raw) return undefined;
    return new Constraints(raw.map(x => new Constraint(x)));
  }
}
