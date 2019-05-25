import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export interface StcModel extends MasterDataItem {
  description: string;
}

export default class Stc implements StcModel {
  readonly id: string;
  readonly name: string;
  readonly description: string;

  constructor(id: string, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  static parse(raw: StcModel): Stc {
    return new Stc(raw.id, raw.name, raw.description);
  }
}

export class Stcs extends MasterDataItems<Stc> {
  static parse(raw: StcModel[]): Stcs | undefined {
    if (!raw) return undefined;
    return new Stcs(raw.map(Stc.parse));
  }
}
