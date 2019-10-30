import MasterDataItemModel from './MasterDataItemModel';
import Id from '@core/types/Id';

export default interface SeasonModel extends MasterDataItemModel {
  readonly seasonTypeId: Id;
  readonly startDate: string;
  readonly endDate: string;
}
