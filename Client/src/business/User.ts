import Id from '@core/types/Id';
import UserModel from '@core/models/UserModel';

export default class User {
  readonly id: Id;
  readonly name: string;
  readonly displayName: string;

  constructor(raw: UserModel) {
    this.id = raw.id;
    this.name = raw.name;
    this.displayName = raw.displayName;
  }
}
