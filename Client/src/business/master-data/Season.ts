import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import SeasonType from './SeasonType';
import MasterData from '.';

export interface SeasonModel extends MasterDataItem {
  startDate: Date;
  endDate: Date;
  seasonTypeId: string;
}

export default class Season implements SeasonModel {
  readonly id: string;
  readonly name: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly seasonTypeId: string;

  constructor(id: string, name: string, startDate: Date, endDate: Date, seasonTypeId: string) {
    this.id = id;
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.seasonTypeId = seasonTypeId;
  }

  static parse(raw: SeasonModel): Season {
    return new Season(raw.id, raw.name, new Date(raw.startDate), new Date(raw.endDate), raw.seasonTypeId);
  }

  getSeasonType(): SeasonType {
    return MasterData.all.seasonTypes.id[this.seasonTypeId];
  }
}

export class Seasons extends MasterDataItems<Season> {
  static parse(raw: SeasonModel[]): Seasons | undefined {
    if (!raw) return undefined;
    return new Seasons(raw.map(Season.parse));
  }
}
