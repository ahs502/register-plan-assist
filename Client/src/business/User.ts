import Id from '@core/types/Id';
import UserModel from '@core/models/UserModel';
import { dataTypes } from 'src/utils/DataType';

export default class User {
  readonly id: Id;
  readonly name: string;
  readonly displayName: string;

  constructor(raw: UserModel) {
    this.id = raw.id;
    this.name = dataTypes.name.convertModelToBusiness(raw.name);
    this.displayName = dataTypes.name.convertModelToBusiness(raw.displayName);
  }
}
