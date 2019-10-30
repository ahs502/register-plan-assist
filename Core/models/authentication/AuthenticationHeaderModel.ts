import Id from '@core/types/Id';

export default interface AuthenticationHeaderModel {
  readonly ip: string;
  readonly userAgent: string;
  readonly expiresAt: string;
  readonly userId: Id;
}
