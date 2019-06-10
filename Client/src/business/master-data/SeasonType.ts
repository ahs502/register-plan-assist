import MasterDataItem, { MasterDataItems, MasterDataItemModel } from './MasterDataItem';

export interface SeasonTypeModel extends MasterDataItemModel {}

export default class SeasonType extends MasterDataItem implements SeasonTypeModel {}

export class SeasonTypes extends MasterDataItems<SeasonType> {
  static parse(raw?: ReadonlyArray<SeasonTypeModel>): SeasonTypes | undefined {
    if (!raw) return undefined;
    return new SeasonTypes(raw.map(x => new SeasonType(x)));
  }
}
