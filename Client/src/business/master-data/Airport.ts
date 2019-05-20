import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class Airport implements MasterDataItem {
  id: string;
  name: string;

  fullName: string;
  international: boolean;

  constructor(id: string, name: string, fullName: string, international: boolean) {
    this.id = id;
    this.name = name;

    this.fullName = fullName;
    this.international = international;
  }

  static parse(raw: any): Airport {
    return new Airport(String(raw['id']), String(raw['id']), String(raw['fullName']), String(raw['international']) === 'true');
  }
}

export class Airports extends MasterDataItems<Airport> {
  static parse(raw: any): Airports | undefined {
    if (!raw) return undefined;
    return new Airports((<Array<any>>raw).map(Airport.parse));
  }
}
