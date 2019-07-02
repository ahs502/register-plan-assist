import MasterDataItemModel from './MasterDataItemModel';

export default interface StcModel extends MasterDataItemModel {
  readonly description: string;
}
