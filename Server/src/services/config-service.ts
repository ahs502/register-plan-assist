import { Router } from 'express';
import ClientConfig from '@core/models/ClientConfig';
import config from 'src/config';
import { create } from 'simple-oauth2';

const router = Router();
export default router;

router.get('/init', async (req, res, next) => {
  const clientConfig: ClientConfig = {
    env: config.env,
    oauth: config.oauth
  };

  const init = `
    +function(){
       const url=new URL(window.location.href);
       const code =url.searchParams.get('code');
       if(!code){
        const config = window.config = ${JSON.stringify(clientConfig, null, 4)};
        const loginUrl = config.oauth.issuer + '?client_id=' + config.oauth.clientId +
         '&redirect_uri=' + config.oauth.api + '/&response_type=code&lang=' + config.oauth.lang +
         '&resource=' + config.oauth.resourceName;
        window.location.href = loginUrl;
       }else{
        const config = window.config = {'oauthCode':code};
       }
    }();
  `;

  res.send(init).end();
});

router.post('/getToken', async (req, res, next) => {
  console.log(req.body.code);
  const oauth2 = create({
    auth: { tokenHost: 'https://login.mahan.aero/adfs/oauth2/token' },
    client: { id: config.oauth.clientId, secret: config.oauth.resourceName }
  });
  console.log(oauth2, null, 4);
  const TOKEN = await oauth2.authorizationCode.getToken({ code: req.body.code, redirect_uri: config.oauth.api });
  console.log(TOKEN, null, 4);
  res.send(req.body.code).end();
});
