import MasterDataItem, { MasterDataItems } from './MasterDataItem';

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

export interface AircraftTypeModel extends MasterDataItem {
  displayOrder: number;
  turnrounds: Readonly<Turnround>[];
}

export default class AircraftType implements MasterDataItem {
  readonly id: string;
  readonly name: string;
  readonly displayOrder: number;
  readonly turnrounds: Readonly<Turnround>[];

  constructor(id: string, name: string, displayOrder: number, turnrounds: Turnround[]) {
    this.id = id;
    this.name = name;
    this.displayOrder = displayOrder;
    this.turnrounds = turnrounds;
  }

  static parse(raw: AircraftTypeModel): AircraftType {
    return new AircraftType(
      raw.id,
      raw.name,
      raw.displayOrder,
      raw.turnrounds.map(rawTurnround => ({
        startDate: new Date(rawTurnround.startDate),
        endDate: new Date(rawTurnround.endDate),
        minimumGroundTime: rawTurnround.minimumGroundTime
      }))
    );
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
  static parse(raw: AircraftTypeModel[]): AircraftTypes | undefined {
    if (!raw) return undefined;
    return new AircraftTypes(raw.map(AircraftType.parse));
  }
}
