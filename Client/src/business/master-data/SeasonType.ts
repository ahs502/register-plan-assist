import MasterDataItem, { MasterDataItems, MasterDataItemModel } from './MasterDataItem';

export interface SeasonTypeModel extends MasterDataItemModel {}

export default class SeasonType extends MasterDataItem implements SeasonTypeModel {
  constructor(raw: SeasonTypeModel) {
    super(raw);
  }
}

export class SeasonTypes extends MasterDataItems<SeasonType> {
  static parse(raw: SeasonTypeModel[]): SeasonTypes | undefined {
    if (!raw) return undefined;
    return new SeasonTypes(raw.map(x => new SeasonType(x)));
  }
}
