import MasterDataItemModel from './MasterDataItemModel';

export default interface SeasonModel extends MasterDataItemModel {
  readonly startDate: string;
  readonly endDate: string;
  readonly seasonTypeId: string;
}
