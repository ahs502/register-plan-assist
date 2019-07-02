import AircraftTypeModel from '../models/master-data/AircraftTypeModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class AircraftType extends MasterDataItem {
  readonly displayOrder: number;
  readonly turnrounds: readonly {
    readonly startDate: Date;
    readonly endDate: Date;
    readonly minimumGroundTime: {
      readonly departureDomestic: number;
      readonly departureInternational: number;
      readonly transitDomestic: number;
      readonly transitInternational: number;
    };
  }[];

  constructor(raw: AircraftTypeModel) {
    super(raw);
    this.displayOrder = raw.displayOrder;
    this.turnrounds = raw.turnrounds.map(t => ({
      startDate: new Date(t.startDate),
      endDate: new Date(t.endDate),
      minimumGroundTime: t.minimumGroundTime
    }));
  }

  getMinimumGroundTime(date: Date, transit: boolean, international: boolean): number {
    const turnround = this.turnrounds.find(t => t.startDate <= date && t.endDate >= date);
    if (!turnround) return 0;
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
  static parse(raw?: readonly AircraftTypeModel[]): AircraftTypes | undefined {
    if (!raw) return undefined;
    return new AircraftTypes(raw.map(x => new AircraftType(x)));
  }
}
