export default interface RpaUserSettingModel {
  readonly timeline?: {
    readonly localtime: boolean;
  };
  readonly flightRequirement?: {
    readonly localTime: boolean;
  };
}
