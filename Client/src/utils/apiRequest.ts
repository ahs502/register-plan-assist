import GetAuthenticationModel from '@core/models/authentication/GetAuthenticationModel';
import AuthenticationResultModel from '@core/models/authentication/AuthenticationResultModel';
import persistant from './persistant';
import ServerResult from '@core/types/ServerResult';

export default async function apiRequest(service: string, command: string, data?: any): Promise<ServerResult> {
  try {
    const response = await fetch(`/api/${service}/${command}`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        Authentication: persistant.encodedAuthenticationHeader!
      },
      redirect: 'follow',
      body: JSON.stringify(data || {})
    });
    if (response.ok) return await response.json();
    if (response.status !== 401) throw new Error(`Code ${response.status}: ${response.statusText}`);
  } catch (reason) {
    return { message: String(reason) };
  }

  // Unauthorized access.

  try {
    const body: GetAuthenticationModel = {
      oauthCode: persistant.oauthCode!,
      refreshToken: persistant.authentication!.refreshToken
    };
    const refreshTokenResponse = await fetch(`/api/oauth/get-authentication`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      body: JSON.stringify(body)
    });
    if (!refreshTokenResponse.ok) throw 'Refresh token failed.';
    const authenticationResult: AuthenticationResultModel = await refreshTokenResponse.json();
    persistant.authentication = authenticationResult.authentication;
    persistant.encodedAuthenticationHeader = authenticationResult.encodedAuthenticationHeader;
  } catch (refreshTokenFailureReason) {
    console.error('Refresh token failure error', refreshTokenFailureReason);

    // Go to login page:
    delete persistant.authentication;
    delete persistant.encodedAuthenticationHeader;
    delete persistant.oauthCode;
    window.location.reload();
  }

  // Token is refreshed.

  try {
    const response = await fetch(`/api/${service}/${command}`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        Authentication: persistant.encodedAuthenticationHeader!
      },
      redirect: 'follow',
      body: JSON.stringify(data || {})
    });
    if (response.ok) return await response.json();
    throw new Error(`Code ${response.status}: ${response.statusText}`);
  } catch (reason) {
    return { message: String(reason) };
  }
}
