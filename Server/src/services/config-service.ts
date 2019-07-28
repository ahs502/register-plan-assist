import { Router } from 'express';
import ClientConfig from '@core/models/ClientConfig';
import config from 'src/config';

const router = Router();
export default router;

router.get('/init', async (req, res, next) => {
  const clientConfig: ClientConfig = {
    env: config.env,
    oauth: config.oauth
  };

  const init = `
    +function(){
      const config = window.config = ${JSON.stringify(clientConfig, null, 4)};

      //const loginUrl = config.oauth.issuer + '/connect/authorize?client_id=' + config.oauth.clientId +
      //  '&redirect_uri=' + config.oauth.api + '/&response_type=code&lang=' + config.oauth.lang +
      //  '&resource=' + config.oauth.resourceName + '&scope=openid offline_access';
      //window.location.href = loginUrl;
    }();
  `;

  res.send(init).end();
});
