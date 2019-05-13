import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class SeasonType implements MasterDataItem {
  id: string;
  name: string;

  constructor(raw: any) {
    this.id = String(raw['id']);
    this.name = String(raw['id']);
  }
}

export class SeasonTypes extends MasterDataItems<SeasonType> {}
