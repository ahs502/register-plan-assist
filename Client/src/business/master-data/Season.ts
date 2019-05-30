import MasterDataItem, { MasterDataItems, MasterDataItemModel } from './MasterDataItem';
import SeasonType from './SeasonType';
import MasterData from '.';

export interface SeasonModel extends MasterDataItemModel {
  startDate: Date;
  endDate: Date;
  seasonTypeId: string;
}

export default class Season extends MasterDataItem implements SeasonModel {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly seasonTypeId: string;

  constructor(raw: SeasonModel) {
    super(raw);
    this.startDate = new Date(raw.startDate);
    this.endDate = new Date(raw.endDate);
    this.seasonTypeId = raw.seasonTypeId;
  }

  getSeasonType(): SeasonType {
    return MasterData.all.seasonTypes.id[this.seasonTypeId];
  }
}

export class Seasons extends MasterDataItems<Season> {
  static parse(raw?: ReadonlyArray<SeasonModel>): Seasons | undefined {
    if (!raw) return undefined;
    return new Seasons(raw.map(x => new Season(x)));
  }
}
