import * as path from 'path';
import * as http from 'http';
import * as express from 'express';

const app = express();

const env = process.env.NODE_ENV || 'production';
app.set('env', env);
//TODO: Configure the project by the env variable. It will be either 'production', 'test' or 'development'.

app.use(express.json());

import apiRouter from './api';
app.use('/api', apiRouter);

app.use('/', express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
app.set('port', port);

const server = http.createServer(app);

server.listen(port);

server.on('error', error => {
  if ((<any>error).code === 'EADDRINUSE') return console.error('Address in use.');
  console.error(error.message || error.name || error);
});

server.on('listening', () => {
  console.log(`Server is listening on port ${port}.`);
});
