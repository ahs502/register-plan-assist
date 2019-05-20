import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import SeasonType from './SeasonType';
import masterData from '.';

export default class Season implements MasterDataItem {
  id: string;
  name: string;

  startDate: Date;
  endDate: Date;

  seasonTypeId: string;

  constructor(id: string, name: string, startDate: Date, endDate: Date, seasonTypeId: string) {
    this.id = id;
    this.name = name;

    this.startDate = startDate;
    this.endDate = endDate;

    this.seasonTypeId = seasonTypeId;
  }

  static parse(raw: any): Season {
    return new Season(String(raw['id']), String(raw['id']), new Date(raw['startDate']), new Date(raw['endDate']), String(raw['seasonTypeId']));
  }

  getSeasonType(): SeasonType {
    return masterData.seasonTypes.id[this.seasonTypeId];
  }
}

export class Seasons extends MasterDataItems<Season> {
  static parse(raw: any): Seasons | undefined {
    if (!raw) return undefined;
    return new Seasons((<Array<any>>raw).map(Season.parse));
  }
}
