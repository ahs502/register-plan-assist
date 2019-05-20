import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class SeasonType implements MasterDataItem {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  static parse(raw: any): SeasonType {
    return new SeasonType(String(raw['id']), String(raw['name']));
  }
}

export class SeasonTypes extends MasterDataItems<SeasonType> {
  static parse(raw: any): SeasonTypes | undefined {
    if (!raw) return undefined;
    return new SeasonTypes((<Array<any>>raw).map(SeasonType.parse));
  }
}
