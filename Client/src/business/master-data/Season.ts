import SeasonModel from '@core/models/master-data/SeasonModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import SeasonType, { SeasonTypes } from './SeasonType';
import MasterData from './MasterData';

export default class Season extends MasterDataItem {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly seasonType: SeasonType;

  constructor(raw: SeasonModel, seasonTypes: SeasonTypes) {
    super(raw);
    this.startDate = new Date(raw.startDate);
    this.endDate = new Date(raw.endDate);
    this.seasonType = seasonTypes.id[raw.seasonTypeId];
  }
}

export class Seasons extends MasterDataItems<Season> {
  static parse(seasonTypes: SeasonTypes, raw?: readonly SeasonModel[]): Seasons | undefined {
    if (!raw) return undefined;
    return new Seasons(raw.map(x => new Season(x, seasonTypes)));
  }
}
