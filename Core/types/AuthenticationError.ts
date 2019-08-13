enum AuthenticationError {
  Unknown = 'UNKNOWN',
  ServerNotAvailable = 'SERVER_NOT_AVAILABLE',
  OAuthServerNotAvailable = 'OAUTH_SERVER_NOT_AVAILABLE',
  CodeNotAvailable = 'CODE_NOT_AVAILABLE',
  InvalidCode = 'INVALID_CODE',
  DatabaseNotAvailable = 'DATABASE_NOT_AVAILABLE',
  UserNotFound = 'USER_NOT_FOUND'
}

export default AuthenticationError;
