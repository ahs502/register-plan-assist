import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export interface ConstraintModel extends MasterDataItem {}

export default class Constraint implements ConstraintModel {
  readonly id: string;
  readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  static parse(raw: ConstraintModel): Constraint {
    return new Constraint(raw.id, raw.name);
  }
}

export class Constraints extends MasterDataItems<Constraint> {
  static parse(raw: ConstraintModel[]): Constraints | undefined {
    if (!raw) return undefined;
    return new Constraints(raw.map(Constraint.parse));
  }
}
