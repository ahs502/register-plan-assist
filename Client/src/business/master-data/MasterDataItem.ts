/**
 * The minimum common contents of any master data item.
 */
export default interface MasterDataItem {
  id: string;
  name: string;
}

/**
 * The base class for any master data collection,
 * mimiking the most applicable aspects of Array.
 */
export abstract class MasterDataItems<T extends MasterDataItem> {
  length: number;
  [index: number]: T;

  id: { [id: string]: T };

  constructor(items: T[]) {
    this.length = items.length;
    this.id = {};
    items.forEach((item, index) => (this[index] = this.id[item.id] = item));
  }

  toArray(): T[] {
    let result = [] as T[];
    for (let i = 0; i < this.length; i++) {
      result.push(this[i]);
    }
    return result;
  }

  forEach(task: (value: T, index: number, array: ArrayLike<T>) => void): void {
    for (let i = 0; i < this.length; i++) {
      task(this[i], i, this);
    }
  }

  map<R>(task: (value: T, index: number, array: ArrayLike<T>) => R): R[] {
    let result = [] as R[];
    for (let i = 0; i < this.length; i++) {
      result.push(task(this[i], i, this));
    }
    return result;
  }

  filter(predicate: (value: T, index: number, array: ArrayLike<T>) => any): T[] {
    let result = [] as T[];
    for (let i = 0; i < this.length; i++) {
      if (predicate(this[i], i, this)) {
        result.push(this[i]);
      }
    }
    return result;
  }

  find(predicate: (value: T, index: number, array: ArrayLike<T>) => any): T | undefined {
    for (let i = 0; i < this.length; i++) {
      if (predicate(this[i], i, this)) return this[i];
    }
    return undefined;
  }
}
