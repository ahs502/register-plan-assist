import '@core/utils/extensions.implementation';
import '@core/utils/validation-init';

import * as path from 'path';
import * as http from 'http';
import * as express from 'express';

// For safe mode (without side effects, see: https://www.npmjs.com/package/colors):
// import * as colors from 'colors/safe'
import 'colors';

const app = express();

const env = process.env.NODE_ENV || 'production';
app.set('env', env);
//TODO: Configure the project by the env variable. It will be either 'production', 'test' or 'development'.

app.use(express.json());

import apiService from './api-service';
app.use('/api', apiService);

app.get('/env', (req, res, next) => {
  res.json(req.app.get('env'));
});

app.use('/', express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
app.set('port', port);

import { withDbAccess } from 'src/utils/sqlServer';
import { fetchAndCacheMasterData } from 'src/services/master-data-service';
import MasterData from '@core/master-data';
import MasterDataModel from '@core/models/master-data/MasterDataModel';

withDbAccess(({ runQuery }) => fetchAndCacheMasterData(Object.keys(MasterData.all) as (keyof MasterDataModel)[], runQuery)).then(
  () => {
    const server = http.createServer(app);

    server.listen(port);

    server.on('error', error => {
      if ((<any>error).code === 'EADDRINUSE') return console.error('Address in use.');
      console.error(error.message || error.name || error);
    });

    server.on('listening', () => {
      console.log(('>>'.bold + ` Server is listening on port ${String(port).bold}:\n`).green);
    });
  },
  reason => {
    console.error(reason);
    console.info(('>>'.bold + ' Restart server in ' + '5'.bold + ' seconds...\n').green);
    setTimeout(() => process.exit(1), 5000);
  }
);
