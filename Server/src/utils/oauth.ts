import * as jwt from 'jsonwebtoken';
import config from 'src/config';

import Cryptr = require('cryptr');
export const cryptr = new Cryptr(config.secretKey);

export interface RawToken {
  readonly access_token: string;
  readonly expires_in: number;
  readonly refresh_token: string;
}
export interface Token {
  readonly expiresAt: string;
  readonly refreshToken: string;
  readonly userName: string;
}

export function jwtDecodeRawToken(rawToken: RawToken): Token {
  const decodedToken = jwt.decode(rawToken.access_token, { complete: true }) as { payload: { unique_name: string } };
  return {
    expiresAt: new Date(Date.now() + rawToken.expires_in * 1000).toJSON(),
    refreshToken: rawToken.refresh_token,
    userName: decodedToken.payload.unique_name
  };
}
