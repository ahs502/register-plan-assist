import ClientConfig from '@core/models/ClientConfig';

export interface Config extends ClientConfig {
  readonly mongodbUrl: string;
  readonly mongodbDatabase: string;
}

const config: Config = require('../config').default;

export default config;
