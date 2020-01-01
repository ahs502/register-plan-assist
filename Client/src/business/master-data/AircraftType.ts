import AircraftTypeModel from '@core/models/master-data/AircraftTypeModel';
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

  getMinimumGroundTime(transit: boolean, international: boolean, startDate: Date, endDate?: Date, method: 'MAXIMUM' | 'MINIMUM' = 'MAXIMUM'): number {
    endDate = endDate || startDate;
    const minimumGroundTimes = this.turnrounds
      .filter(t => t.startDate <= endDate! && t.endDate >= startDate)
      .map(turnround =>
        transit
          ? international
            ? turnround.minimumGroundTime.transitInternational
            : turnround.minimumGroundTime.transitDomestic
          : international
          ? turnround.minimumGroundTime.departureInternational
          : turnround.minimumGroundTime.departureDomestic
      );
    if (minimumGroundTimes.length === 0) return 0;
    return method === 'MAXIMUM' ? Math.max(...minimumGroundTimes) : Math.min(...minimumGroundTimes);
  }
}

export class AircraftTypes extends MasterDataItems<AircraftType> {
  static parse(raw?: readonly AircraftTypeModel[]): AircraftTypes | undefined {
    if (!raw) return undefined;
    return new AircraftTypes(raw.map(x => new AircraftType(x)));
  }
}
