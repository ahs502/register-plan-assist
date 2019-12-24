import Id from '@core/types/Id';
import UserModel from '@core/models/UserModel';

export default interface PreplanHeaderModel {
  readonly id: Id;

  readonly name: string;
  readonly published: boolean;
  readonly accepted: boolean;

  readonly user: UserModel;

  readonly parentPreplanHeader?: {
    readonly id: Id;
    readonly name: string;
    readonly user: UserModel;
  };

  readonly creationDateTime: string;

  readonly startDate: string;
  readonly endDate: string;
}
