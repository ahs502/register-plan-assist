import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class Constraint implements MasterDataItem {
  id: string;
  name: string;

  constructor(raw: any) {
    this.id = String(raw['id']);
    this.name = String(raw['name']);
  }
}

export class Constraints extends MasterDataItems<Constraint> {}
