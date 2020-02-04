import AirportModel from '@core/models/master-data/AirportModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class Airport extends MasterDataItem {
  readonly fullName: string;
  readonly international: boolean;
  readonly utcOffsets: readonly {
    readonly dst: boolean;
    readonly startDateTimeUtc: Date;
    readonly endDateTimeUtc: Date;
    readonly startDateTimeLocal: Date;
    readonly endDateTimeLocal: Date;
    /** In minutes. */ readonly offset: number;
  }[];

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

  getUtcOffsetFromLocalTime(localDateTime: Date): number {
    return this.utcOffsets.filter(o => o.startDateTimeLocal <= localDateTime && o.endDateTimeLocal > localDateTime).reduce((a, o) => a + o.offset, 0);
  }

  getUtcOffsetFromUtcTime(utcDateTime: Date): number {
    return this.utcOffsets.filter(o => o.startDateTimeUtc <= utcDateTime && o.endDateTimeUtc > utcDateTime).reduce((a, o) => a + o.offset, 0);
  }
}

export class Airports extends MasterDataItems<Airport> {
  static parse(raw?: readonly AirportModel[]): Airports | undefined {
    if (!raw) return undefined;
    return new Airports(raw.map(x => new Airport(x)));
  }
}
