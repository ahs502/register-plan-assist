import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class Stc implements MasterDataItem {
  id: string;
  name: string;

  description: string;

  constructor(id: string, name: string, description: string) {
    this.id = id;
    this.name = name;

    this.description = description;
  }

  static parse(raw: any): Stc {
    return new Stc(String(raw['id']), String(raw['id']), String(raw['description']));
  }
}

export class Stcs extends MasterDataItems<Stc> {
  static parse(raw: any): Stcs | undefined {
    if (!raw) return undefined;
    return new Stcs((<Array<any>>raw).map(Stc.parse));
  }
}
