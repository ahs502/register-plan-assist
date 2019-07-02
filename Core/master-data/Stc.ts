import StcModel from '../models/master-data/StcModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class Stc extends MasterDataItem {
  constructor(raw: StcModel) {
    super(raw, raw.description);
  }
}

export class Stcs extends MasterDataItems<Stc> {
  static parse(raw?: readonly StcModel[]): Stcs | undefined {
    if (!raw) return undefined;
    return new Stcs(raw.map(x => new Stc(x)));
  }
}
