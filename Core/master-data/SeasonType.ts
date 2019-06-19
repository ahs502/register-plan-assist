import SeasonTypeModel from '../models/master-data/SeasonTypeModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class SeasonType extends MasterDataItem {}

export class SeasonTypes extends MasterDataItems<SeasonType> {
  static parse(raw?: readonly SeasonTypeModel[]): SeasonTypes | undefined {
    if (!raw) return undefined;
    return new SeasonTypes(raw.map(x => new SeasonType(x)));
  }
}
