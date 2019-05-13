import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class AircraftType implements MasterDataItem {
  id: string;
  name: string;

  displayOrder: number;

  turnrounds: Turnround[];

  constructor(raw: any) {
    this.id = String(raw['id']);
    this.name = String(raw['name']);

    this.displayOrder = Number(raw['displayOrder']);

    this.turnrounds = (<Array<any>>raw['turnrounds']).map(rawTurnround => ({
      startDate: new Date(rawTurnround['startData']),
      endDate: new Date(rawTurnround['endDate']),
      minimumGroundTime: {
        departureDomestic: Number(rawTurnround['departureDomestic']),
        departureInternational: Number(rawTurnround['departureInternational']),
        transitDomestic: Number(rawTurnround['transitDomestic']),
        transitInternational: Number(rawTurnround['transitInternational'])
      }
    }));
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

interface Turnround {
  startDate: Date;
  endDate: Date;
  minimumGroundTime: MinimumGroundTime;
}
interface MinimumGroundTime {
  departureDomestic: number;
  departureInternational: number;
  transitDomestic: number;
  transitInternational: number;
}

export class AircraftTypes extends MasterDataItems<AircraftType> {}
