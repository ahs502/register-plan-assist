//import { AreaEnv, AreaConfig } from '@core/security/ouath/ClientConfig';

export const OuathUrls = () => {
  //const area  = Config.get(areaKey);
  const area = 'http://www.google.com'; //, Config.get();
  return {
    area
    // changepasswordUrl: `${area.issuer}/manage/changepassword?clientId=${area.clientId}&redirectUrl=${area.api}/`,
    // loginUrl: `${area.issuer}/connect/authorize?client_id=${area.clientId}&redirect_uri=${area.api}/&response_type=code&lang=${area.lang}&resource=${
    //   area.resourceName
    // }&scope=openid offline_access`,
    // registerUrl: `${area.issuer}/Users/Register?lang=${area.lang}&returnUrl=${encodeURIComponent(
    //   `${area.issuer}/connect/authorize?client_id=${area.clientId}&redirect_uri=${area.api}&response_type=code&lang=${area.lang}&resource=${
    //     area.resourceName
    //   }&scope=openid offline_access`
    // )}`
  };
};
