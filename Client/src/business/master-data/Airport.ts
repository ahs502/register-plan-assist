import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export interface AirportModel extends MasterDataItem {
  fullName: string;
  international: boolean;
}

export default class Airport implements AirportModel {
  readonly id: string;
  readonly name: string;
  readonly fullName: string;
  readonly international: boolean;

  constructor(id: string, name: string, fullName: string, international: boolean) {
    this.id = id;
    this.name = name;
    this.fullName = fullName;
    this.international = international;
  }

  static parse(raw: AirportModel): Airport {
    return new Airport(raw.id, raw.name, raw.fullName, raw.international);
  }
}

export class Airports extends MasterDataItems<Airport> {
  static parse(raw: AirportModel[]): Airports | undefined {
    if (!raw) return undefined;
    return new Airports(raw.map(Airport.parse));
  }
}
