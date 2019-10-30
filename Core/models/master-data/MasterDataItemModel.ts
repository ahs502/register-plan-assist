import Id from '@core/types/Id';

/**
 * The minimum common content model of any master data item.
 */
export default interface MasterDataItemModel {
  readonly id: Id;
  readonly name: string;
}
