import Id from '@core/types/Id';

export default interface UserModel {
  readonly id: Id;
  readonly name: string;
  readonly displayName: string;
}
