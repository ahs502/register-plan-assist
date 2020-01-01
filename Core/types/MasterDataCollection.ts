import MasterDataItemModel from '@core/models/master-data/MasterDataItemModel';

export default interface MasterDataCollection<I extends MasterDataItemModel> {
  readonly items: readonly I[];
  readonly id: {
    [id: string]: I;
  };
  readonly name: {
    [name: string]: I;
  };
}
