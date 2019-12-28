import StcModel from '@core/models/master-data/StcModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class Stc extends MasterDataItem {
  readonly description: string;

  constructor(raw: StcModel) {
    super(raw);
    this.description = raw.description;
  }
}

export class Stcs extends MasterDataItems<Stc> {
  static parse(raw?: readonly StcModel[]): Stcs | undefined {
    if (!raw) return undefined;
    return new Stcs(raw.map(x => new Stc(x)));
  }
}
