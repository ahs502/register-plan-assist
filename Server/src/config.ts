export interface Config {
  readonly mongodbUrl: string;
  readonly mongodbDatabase: string;
}

const config: Config = require('../config').default;

export default config;
