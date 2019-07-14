import ClientConfig from '@core/models/ClientConfig';

export interface Config extends ClientConfig {
  sqlServer: {
    server: string;
    database: string;
    username: string;
    password: string;
  };
}

const config: Config = require('../config').default;

export default config;
