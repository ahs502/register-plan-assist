import Env from '@core/types/Env';

export default interface ClientConfig {
  readonly env: Env;
  readonly version: string;
  readonly oauth: {
    readonly serverUrl: string;
    readonly serverIssuer: string;
    readonly clientUrl: string;
    readonly clientId: string;
    readonly resourceName: string;
    readonly lang: string;
  };
}
