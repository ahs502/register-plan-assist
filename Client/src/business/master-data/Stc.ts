import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class Stc implements MasterDataItem {
  id: string;
  name: string;

  description: string;

  constructor(raw: any) {
    this.id = String(raw['id']);
    this.name = String(raw['id']);

    this.description = String(raw['description']);
  }
}

export class Stcs extends MasterDataItems<Stc> {}
