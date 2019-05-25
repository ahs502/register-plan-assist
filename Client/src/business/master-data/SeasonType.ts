import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export interface SeasonTypeModel extends MasterDataItem {}

export default class SeasonType implements SeasonTypeModel {
  readonly id: string;
  readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  static parse(raw: SeasonTypeModel): SeasonType {
    return new SeasonType(raw.id, raw.name);
  }
}

export class SeasonTypes extends MasterDataItems<SeasonType> {
  static parse(raw: SeasonTypeModel[]): SeasonTypes | undefined {
    if (!raw) return undefined;
    return new SeasonTypes(raw.map(SeasonType.parse));
  }
}
