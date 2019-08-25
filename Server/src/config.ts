import ClientConfig from '@core/models/config/ClientConfig';

export interface Config extends ClientConfig {
  readonly sqlServer: {
    readonly server: string;
    readonly database: string;
    readonly username: string;
    readonly password: string;
  };
  readonly secretKey: string;
}

const config: Config = {
  ...require('../config').default,
  version: require('../package.json').version
};

export default config;
