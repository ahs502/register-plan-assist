import SeasonModel from '../models/master-data/SeasonModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import SeasonType from './SeasonType';
import MasterData from './MasterData';

export default class Season extends MasterDataItem {
  readonly startDate: Date;
  readonly endDate: Date;

  private readonly seasonTypeId: string;

  constructor(raw: SeasonModel) {
    super(raw);
    this.startDate = new Date(raw.startDate);
    this.endDate = new Date(raw.endDate);
    this.seasonTypeId = raw.seasonTypeId;
  }

  get seasonType(): SeasonType {
    return MasterData.all.seasonTypes.id[this.seasonTypeId];
  }
}

export class Seasons extends MasterDataItems<Season> {
  static parse(raw?: readonly SeasonModel[]): Seasons | undefined {
    if (!raw) return undefined;
    return new Seasons(raw.map(x => new Season(x)));
  }
}
