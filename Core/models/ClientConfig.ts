export type EnvType = 'development' | 'test' | 'production';

export interface ClientConfig {
  env: EnvType;
  ouathApi: string;
  ouathIssuer: string;
  ouathResourceName: string;
  ouathClientId: string;
  ouathLang: string;
}
