export default interface MasterDataItem {
  id: string;
  name: string;
}

export class MasterDataItems<T extends MasterDataItem> {
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

  forEach(task: (item: T) => void): void {
    for (let i = 0; i < this.length; i++) {
      task(this[i]);
    }
  }

  map<R>(task: (item: T) => R): R[] {
    let result = [] as R[];
    for (let i = 0; i < this.length; i++) {
      result.push(task(this[i]));
    }
    return result;
  }

  filter(predicate: (item: T) => boolean): T[] {
    let result = [] as T[];
    for (let i = 0; i < this.length; i++) {
      if (predicate(this[i])) {
        result.push(this[i]);
      }
    }
    return result;
  }

  find(predicate: (item: T) => boolean): T | undefined {
    for (let i = 0; i < this.length; i++) {
      if (predicate(this[i])) return this[i];
    }
    return undefined;
  }
}
