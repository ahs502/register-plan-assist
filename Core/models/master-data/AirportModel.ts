import MasterDataItemModel from './MasterDataItemModel';

export default interface AirportModel extends MasterDataItemModel {
  readonly fullName: string;
  readonly international: boolean;
  readonly utcOffsets: readonly {
    readonly dst: boolean;
    readonly startDateTimeUtc: string;
    readonly endDateTimeUtc: string;
    readonly startDateTimeLocal: string;
    readonly endDateTimeLocal: string;
    readonly offset: number;
  }[];
}
