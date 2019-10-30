import Id from '@core/types/Id';
import UserModel from '@core/models/UserModel';

export default interface PreplanHeaderModel {
  readonly id: Id;

  readonly name: string;
  readonly published: boolean;
  readonly finalized: boolean;

  readonly user: UserModel;

  readonly parentPreplan?: {
    readonly id: Id;
    readonly name: string;
    readonly user: UserModel;
  };

  readonly creationDateTime: string;
  readonly lastEditDateTime: string;

  readonly startDate: string;
  readonly endDate: string;

  readonly simulation?: {
    readonly id: Id;
    readonly name: string;
  };
}
