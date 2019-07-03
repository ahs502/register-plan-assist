import { Router } from 'express';
import config from 'src/config';
import { ClientConfig } from '@core/models/ClientConfig';

const router = Router();
export default router;

router.get('/get-client-config', async function getClientConfig(req, res, next) {
  const result: ClientConfig = {
    ouathApi: config.ouathApi,
    ouathClientId: config.ouathClientId,
    ouathIssuer: config.ouathIssuer,
    env: config.env,
    ouathResourceName: config.ouathResourceName,
    ouathLang: config.ouathLang
  };
  console.log('tttttttttttt');
  const configJson = JSON.stringify(result);
  const configurer = '+function(){window.config=`' + configJson + '`}();\n';
  res.send(configurer).end();
});
