import MasterDataItem, { MasterDataItems, MasterDataItemModel } from './MasterDataItem';

export interface UtcOffset {
  dst: boolean;
  startDateTimeUtc: Date;
  endDateTimeUtc: Date;
  startDateTimeLocal: Date;
  endDateTimeLocal: Date;

  /** In minutes. */
  offset: number;
}

export interface AirportModel extends MasterDataItemModel {
  fullName: string;
  international: boolean;
  utcOffsets: ReadonlyArray<Readonly<UtcOffset>>;
}

export default class Airport extends MasterDataItem implements AirportModel {
  readonly fullName: string;
  readonly international: boolean;
  readonly utcOffsets: ReadonlyArray<Readonly<UtcOffset>>;

  constructor(raw: AirportModel) {
    super(raw);
    this.fullName = raw.fullName;
    this.international = raw.international;
    this.utcOffsets = raw.utcOffsets.map(o => ({
      dst: o.dst,
      startDateTimeUtc: new Date(o.startDateTimeUtc),
      endDateTimeUtc: new Date(o.endDateTimeUtc),
      startDateTimeLocal: new Date(o.startDateTimeLocal),
      endDateTimeLocal: new Date(o.endDateTimeLocal),
      offset: o.offset
    }));
  }

  convertUtcToLocal(utcDateTime: Date): Date {
    let offset = this.utcOffsets.filter(o => o.startDateTimeUtc <= utcDateTime && o.endDateTimeUtc > utcDateTime).reduce((a, o) => a + o.offset, 0);
    return new Date(utcDateTime).addMinutes(offset);
  }
  convertLocalToUtc(localDateTime: Date): Date {
    const offset = this.utcOffsets.filter(o => o.startDateTimeLocal <= localDateTime && o.endDateTimeLocal > localDateTime).reduce((a, o) => a + o.offset, 0);
    return new Date(localDateTime).addMinutes(-offset);
  }
}

export class Airports extends MasterDataItems<Airport> {
  static parse(raw?: ReadonlyArray<AirportModel>): Airports | undefined {
    if (!raw) return undefined;
    return new Airports(raw.map(x => new Airport(x)));
  }
}
