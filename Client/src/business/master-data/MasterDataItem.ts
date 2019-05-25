/**
 * The minimum common content model of any master data item.
 */
export interface MasterDataItemModel {
  id: string;
  name: string;
}

/**
 * The minimum common contents of any master data item.
 */
export default abstract class MasterDataItem implements MasterDataItemModel {
  readonly id: string;
  readonly name: string;

  constructor(raw: MasterDataItemModel) {
    this.id = raw.id;
    this.name = raw.name;
  }
}

/**
 * The base class for any master data collection,
 * containing both the array and dictionary by id form of the collection items.
 */
export abstract class MasterDataItems<T extends MasterDataItem> {
  readonly items: T[];
  readonly id: { [id: string]: T };

  protected constructor(items: T[]) {
    this.items = items;
    this.id = {};
    items.forEach(item => (this.id[item.id] = item));
  }
}
