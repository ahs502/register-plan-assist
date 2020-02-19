export default interface RpaUserSettingModel {
  [preplanId: string]: PreplanSettingModel;
}

export interface PreplanSettingModel {
  readonly timeline?: {
    readonly localtime: boolean;
  };
  readonly flightRequirement?: {
    readonly localTime: boolean;
  };
  readonly ConnectionReport?: {
    readonly westAirports: string[];
    readonly eastAirports: string[];
  };
}
