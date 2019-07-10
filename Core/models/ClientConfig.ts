import Env from '@core/types/Env';

export default interface ClientConfig {
  env: Env;
  oauth: { issuer: string; api: string; clientId: string; resourceName: string; lang: string };
}
