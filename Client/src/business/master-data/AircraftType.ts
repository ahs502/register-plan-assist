import MasterDataItem, { MasterDataItems, MasterDataItemModel } from './MasterDataItem';

export interface MinimumGroundTime {
  departureDomestic: number;
  departureInternational: number;
  transitDomestic: number;
  transitInternational: number;
}

export interface Turnround {
  startDate: Date;
  endDate: Date;
  minimumGroundTime: Readonly<MinimumGroundTime>;
}

export interface AircraftTypeModel extends MasterDataItemModel {
  displayOrder: number;
  turnrounds: ReadonlyArray<Readonly<Turnround>>;
}

export default class AircraftType extends MasterDataItem implements MasterDataItem {
  readonly displayOrder: number;
  readonly turnrounds: ReadonlyArray<Readonly<Turnround>>;

  constructor(raw: AircraftTypeModel) {
    super(raw);
    this.displayOrder = raw.displayOrder;
    this.turnrounds = raw.turnrounds.map(rawTurnround => ({
      startDate: new Date(rawTurnround.startDate),
      endDate: new Date(rawTurnround.endDate),
      minimumGroundTime: rawTurnround.minimumGroundTime
    }));
  }

  getMinimumGroundTime(date: Date, transit: boolean, international: boolean): number {
    const result = this.turnrounds.find(t => t.startDate <= date && t.endDate >= date);
    if (!result) return 0;
    const turnround = result as Turnround;
    return transit
      ? international
        ? turnround.minimumGroundTime.transitInternational
        : turnround.minimumGroundTime.transitDomestic
      : international
      ? turnround.minimumGroundTime.departureInternational
      : turnround.minimumGroundTime.departureDomestic;
  }
}

export class AircraftTypes extends MasterDataItems<AircraftType> {
  static parse(raw?: ReadonlyArray<AircraftTypeModel>): AircraftTypes | undefined {
    if (!raw) return undefined;
    return new AircraftTypes(raw.map(x => new AircraftType(x)));
  }
}
