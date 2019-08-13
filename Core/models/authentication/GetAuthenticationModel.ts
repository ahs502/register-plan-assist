export default interface GetAuthenticationModel {
  readonly oauthCode: string;
  readonly refreshToken?: string;
}
