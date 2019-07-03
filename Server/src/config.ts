import { EnvType } from '@core/models/ClientConfig';

export interface Config {
  readonly mongodbUrl: string;
  readonly mongodbDatabase: string;
  readonly env: EnvType;
  readonly ouathResourceName: string;
  readonly ouathApi: string;
  readonly ouathIssuer: string;
  readonly ouathClientId: string;
  readonly ouathLang: string;
}

const config: Config = require('../config').default;

export default config;
