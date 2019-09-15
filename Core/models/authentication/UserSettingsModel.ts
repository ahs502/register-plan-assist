export default interface UserSettingsModel {
  readonly stcColors: {
    readonly [stcName: string]: string;
  };
}
