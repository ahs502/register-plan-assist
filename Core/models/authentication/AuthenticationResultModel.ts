import AuthenticationModel from './AuthenticationModel';

export default interface AuthenticationResultModel {
  readonly error?: string;
  readonly encodedAuthenticationHeader?: string;
  readonly authentication?: AuthenticationModel;
}
