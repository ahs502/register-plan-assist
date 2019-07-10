import MasterDataItemModel from '@core/models/master-data/MasterDataItemModel';

/**
 * The minimum common contents of any master data item.
 */
export default abstract class MasterDataItem {
  readonly id: string;
  readonly name: string;
  readonly description?: string;

  constructor(raw: MasterDataItemModel, description?: string) {
    this.id = raw.id;
    this.name = raw.name;
    description && (this.description = description);
  }
}

/**
 * The base class for any master data collection,
 * containing both the array and dictionary by id form of the collection items.
 */
export abstract class MasterDataItems<T extends MasterDataItem> {
  readonly items: ReadonlyArray<T>;
  readonly id: { readonly [id: string]: T };

  protected constructor(items: ReadonlyArray<T>) {
    this.items = items;
    this.id = {};
    items.forEach(item => ((this.id as { [id: string]: T })[item.id] = item));
  }
}
