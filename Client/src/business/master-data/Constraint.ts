import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class Constraint implements MasterDataItem {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  static parse(raw: any): Constraint {
    return new Constraint(String(raw['id']), String(raw['name']));
  }
}

export class Constraints extends MasterDataItems<Constraint> {
  static parse(raw: any): Constraints | undefined {
    if (!raw) return undefined;
    return new Constraints((<Array<any>>raw).map(Constraint.parse));
  }
}
