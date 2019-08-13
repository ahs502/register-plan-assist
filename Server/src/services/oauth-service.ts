import { Router } from 'express';
import fetch, { Response } from 'node-fetch';
import * as https from 'https';
import * as querystring from 'querystring';
import config from 'src/config';
import { withDbAccess } from 'src/utils/sqlServer';
import { jwtDecodeRawToken, RawToken, cryptr } from 'src/utils/oauth';
import UserModel from '@core/models/authentication/UserModel';
import AuthenticationModel from '@core/models/authentication/AuthenticationModel';
import AuthenticationHeaderModel from '@core/models/authentication/AuthenticationHeaderModel';
import AuthenticationResultModel from '@core/models/authentication/AuthenticationResultModel';
import AuthenticationError from '@core/types/AuthenticationError';
import GetAuthenticationModel from '@core/models/authentication/GetAuthenticationModel';

const router = Router();
export default router;

router.post('/get-authentication', async (req, res, next) => {
  try {
    const { oauthCode, refreshToken }: GetAuthenticationModel = req.body;
    if (!oauthCode) throw AuthenticationError.CodeNotAvailable;

    const rawToken = await getRawToken(oauthCode, refreshToken);
    const token = jwtDecodeRawToken(rawToken);
    const user = await getUser(token.userName);
    const authenticationHeader: AuthenticationHeaderModel = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      expiresAt: token.expiresAt,
      userId: user.id
    };
    const encodedAuthenticationHeader = cryptr.encrypt(JSON.stringify(authenticationHeader));
    const authentication: AuthenticationModel = {
      refreshToken: token.refreshToken,
      user
    };
    const authenticationResult: AuthenticationResultModel = { encodedAuthenticationHeader, authentication };
    res.send(authenticationResult).end();
  } catch (error) {
    const authenticationResult: AuthenticationResultModel = { error };
    res.send(authenticationResult).end();
  }

  async function getRawToken(code: string, refreshToken?: string): Promise<RawToken> {
    let response: Response;
    try {
      const body: any = {
        grant_type: 'authorization_code',
        client_id: config.oauth.clientId,
        code: encodeURI(code)
      };
      if (refreshToken) {
        body.refresh_token = refreshToken;
      } else {
        body.redirect_uri = config.oauth.clientUrl;
      }
      response = await fetch(config.oauth.serverUrl, {
        method: 'POST',
        body: querystring.stringify(body),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        agent: new https.Agent({
          rejectUnauthorized: false
        })
      });
    } catch (error) {
      throw AuthenticationError.OAuthServerNotAvailable;
    }
    if (!response.ok) throw AuthenticationError.InvalidCode;
    const rawToken: RawToken = await response.json();
    return rawToken;
  }

  async function getUser(userName: string): Promise<UserModel> {
    let users: readonly UserModel[];
    try {
      users = await withDbAccess(access =>
        access.runQuery(
          `
          select top 1
            u.[Id]                        as [id],
            u.[Username]                  as [name],
            u.[DisplayName]               as [displayName]
          from
            [AccessMgmt].[User]              as u
          where
            u.[Username] = @username
            and
              u.[IsActive] = 1
        `,
          access.runQuery.nVarCharParam('username', userName, 200)
        )
      );
    } catch (error) {
      throw AuthenticationError.DatabaseNotAvailable;
    }
    if (users.length === 0) throw AuthenticationError.UserNotFound;
    const user = users[0];
    return user;
  }
});
