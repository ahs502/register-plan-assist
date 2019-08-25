import { Router } from 'express';
import ClientConfig from '@core/models/config/ClientConfig';
import config from 'src/config';

const router = Router();
export default router;

const clientConfig: ClientConfig = {
  env: config.env,
  version: config.version,
  oauth: config.oauth
};

router.get('/init', (req, res, next) => {
  const init = `
    +function(){
      window.config = ${JSON.stringify(clientConfig, null, 4)};
    }();
  `;
  res.send(init).end();
});
