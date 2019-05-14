import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import SeasonType from './SeasonType';
import masterData from '.';

export default class Season implements MasterDataItem {
  id: string;
  name: string;

  startDate: Date;
  endDate: Date;

  seasonTypeId: string;

  constructor(raw: any) {
    this.id = String(raw['id']);
    this.name = String(raw['id']);

    this.startDate = new Date(raw['startDate']);
    this.endDate = new Date(raw['endDate']);

    this.seasonTypeId = String(raw['seasonTypeId']);
  }

  getSeasonType(): SeasonType {
    return masterData.seasonTypes.id[this.seasonTypeId];
  }
}

export class Seasons extends MasterDataItems<Season> {}
