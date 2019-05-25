import MasterDataItem, { MasterDataItems, MasterDataItemModel } from './MasterDataItem';

export interface StcModel extends MasterDataItemModel {
  description: string;
}

export default class Stc extends MasterDataItem implements StcModel {
  readonly description: string;

  constructor(raw: StcModel) {
    super(raw);
    this.description = raw.description;
  }
}

export class Stcs extends MasterDataItems<Stc> {
  static parse(raw: StcModel[]): Stcs | undefined {
    if (!raw) return undefined;
    return new Stcs(raw.map(x => new Stc(x)));
  }
}
