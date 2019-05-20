import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export interface Turnround {
  startDate: Date;
  endDate: Date;
  minimumGroundTime: MinimumGroundTime;
}

export interface MinimumGroundTime {
  departureDomestic: number;
  departureInternational: number;
  transitDomestic: number;
  transitInternational: number;
}

export default class AircraftType implements MasterDataItem {
  id: string;
  name: string;

  displayOrder: number;

  turnrounds: Turnround[];

  constructor(id: string, name: string, displayOrder: number, turnrounds: Turnround[]) {
    this.id = id;
    this.name = name;

    this.displayOrder = displayOrder;

    this.turnrounds = turnrounds;
  }

  static parse(raw: any): AircraftType {
    return new AircraftType(
      String(raw['id']),
      String(raw['name']),
      Number(raw['displayOrder']),
      (<Array<any>>raw['turnrounds']).map(rawTurnround => ({
        startDate: new Date(rawTurnround['startData']),
        endDate: new Date(rawTurnround['endDate']),
        minimumGroundTime: {
          departureDomestic: Number(rawTurnround['departureDomestic']),
          departureInternational: Number(rawTurnround['departureInternational']),
          transitDomestic: Number(rawTurnround['transitDomestic']),
          transitInternational: Number(rawTurnround['transitInternational'])
        }
      }))
    );
  }

  getMinimumGroundTime(date: Date, isTransit: boolean, isInternational: boolean): number {
    const result = this.turnrounds.find(t => t.startDate <= date && t.endDate >= date);
    if (!result) return 0;
    const turnround = result as Turnround;
    return isTransit
      ? isInternational
        ? turnround.minimumGroundTime.transitInternational
        : turnround.minimumGroundTime.transitDomestic
      : isInternational
      ? turnround.minimumGroundTime.departureInternational
      : turnround.minimumGroundTime.departureDomestic;
  }
}

export class AircraftTypes extends MasterDataItems<AircraftType> {
  static parse(raw: any): AircraftTypes | undefined {
    if (!raw) return undefined;
    return new AircraftTypes((<Array<any>>raw).map(AircraftType.parse));
  }
}
