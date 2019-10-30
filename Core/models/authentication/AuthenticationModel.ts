import UserModel from '../UserModel';
import UserSettingsModel from './UserSettingsModel';

export default interface AuthenticationModel {
  readonly refreshToken: string;
  readonly user: UserModel;
  readonly userSettings: UserSettingsModel;
  //TODO: readonly permissions: PermissionModel or something like this;
}
