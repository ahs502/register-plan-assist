import MasterDataItemModel from './MasterDataItemModel';
import Id from '@core/types/Id';

export default interface AircraftRegisterModel extends MasterDataItemModel {
  readonly aircraftTypeId: Id;
  readonly validPeriods: readonly {
    readonly startDate: string;
    readonly endDate: string;
  }[];
}
