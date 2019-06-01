export interface Config {
  mongodbUrl: string;
  mongodbDatabase: string;
}

const config: Readonly<Config> = require('../config');

export default config;
