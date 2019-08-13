import UserModel from './UserModel';

export default interface AuthenticationModel {
  readonly refreshToken: string;
  readonly user: UserModel;
  //TODO: readonly permissions: PermissionModel or something like this;
}
