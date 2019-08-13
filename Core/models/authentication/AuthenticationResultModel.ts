import AuthenticationModel from './AuthenticationModel';
import AuthenticationError from '@core/types/AuthenticationError';

export default interface AuthenticationResultModel {
  readonly error?: AuthenticationError;
  readonly encodedAuthenticationHeader?: string;
  readonly authentication?: AuthenticationModel;
}
