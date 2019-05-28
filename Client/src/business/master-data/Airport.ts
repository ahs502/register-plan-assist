import MasterDataItem, { MasterDataItems, MasterDataItemModel } from './MasterDataItem';

export interface AirportModel extends MasterDataItemModel {
  fullName: string;
  international: boolean;
}

export default class Airport extends MasterDataItem implements AirportModel {
  readonly fullName: string;
  readonly international: boolean;

  constructor(raw: AirportModel) {
    super(raw);
    this.fullName = raw.fullName;
    this.international = raw.international;
  }
}

export class Airports extends MasterDataItems<Airport> {
  static parse(raw?: ReadonlyArray<AirportModel>): Airports | undefined {
    if (!raw) return undefined;
    return new Airports(raw.map(x => new Airport(x)));
  }
}
