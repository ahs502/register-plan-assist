import { Router } from 'express';
import fetch, { Response } from 'node-fetch';
import * as https from 'https';
import * as querystring from 'querystring';
import config from 'src/config';
import { withDbAccess } from 'src/utils/sqlServer';
import { jwtDecodeRawToken, RawToken, cryptr } from 'src/utils/oauth';
import UserModel from '@core/models/UserModel';
import AuthenticationModel from '@core/models/authentication/AuthenticationModel';
import AuthenticationHeaderModel from '@core/models/authentication/AuthenticationHeaderModel';
import AuthenticationResultModel from '@core/models/authentication/AuthenticationResultModel';
import GetAuthenticationModel from '@core/models/authentication/GetAuthenticationModel';
import UserSettingsModel from '@core/models/authentication/UserSettingsModel';

const router = Router();
export default router;

router.post('/get-authentication', async (req, res, next) => {
  try {
    const { oauthCode, refreshToken }: GetAuthenticationModel = req.body;
    if (!oauthCode) throw 'Code is not provided.';

    const rawToken = await getRawToken(oauthCode, refreshToken);
    const token = jwtDecodeRawToken(rawToken);
    const user = await getUser(token.userName);
    const userSettings = await getUserSettings(token.userName); //TODO: Improve efficiency by doing all queries in one connection.
    const authenticationHeader: AuthenticationHeaderModel = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      expiresAt: token.expiresAt,
      userId: user.id
    };
    const encodedAuthenticationHeader = cryptr.encrypt(JSON.stringify(authenticationHeader));
    const authentication: AuthenticationModel = {
      refreshToken: token.refreshToken,
      user,
      userSettings
    };
    const authenticationResult: AuthenticationResultModel = { encodedAuthenticationHeader, authentication };
    res.send(authenticationResult).end();
  } catch (error) {
    console.error('GetAuthentication Error:', error);
    const authenticationResult: AuthenticationResultModel = { error: String(error) };
    res.send(authenticationResult).end();
  }

  async function getRawToken(code: string, refreshToken?: string): Promise<RawToken> {
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

    const response = await fetch(config.oauth.serverUrl, {
      method: 'POST',
      body: querystring.stringify(body),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      agent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    if (!response.ok) throw 'Unable to get raw token from OAuth server.';

    const rawToken: RawToken = await response.json();
    return rawToken;
  }

  async function getUser(userName: string): Promise<UserModel> {
    const users: readonly UserModel[] = await withDbAccess(({ runQuery }) =>
      runQuery(
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
        runQuery.nVarCharParam('username', userName, 200)
      )
    );

    if (users.length === 0) throw 'User is not found.';

    const user = users[0];
    return user;
  }

  async function getUserSettings(userName: string): Promise<UserSettingsModel> {
    const rawUserSettings: readonly { Key: string; Value: string }[] = await withDbAccess(({ runSp }) =>
      runSp('[System].[SP_GetUserSettings]', runSp.nVarCharParam('username', userName, 200))
    );

    const stcColorsPrefix = 'fp:stcColors:STC ';
    const userSettings: UserSettingsModel = {
      stcColors: rawUserSettings
        .filter(({ Key, Value }) => Key.startsWith(stcColorsPrefix) && Value)
        .toDictionary(
          ({ Key }) => Key.slice(stcColorsPrefix.length),
          ({ Value }) => Value
        )
    };

    return userSettings;
  }
});
