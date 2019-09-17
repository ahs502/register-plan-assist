import MasterDataItemModel from './MasterDataItemModel';

export default interface AircraftRegisterModel extends MasterDataItemModel {
  readonly aircraftTypeId: string;
  readonly validPeriods: readonly {
    readonly startDate: string;
    readonly endDate: string;
  }[];
}
