export default interface AutoArrangerOptions {
  minimumGroundTimeMode: MinimumGroundTimeMode;
  minimumGroundTimeOffset: number;
}

export enum MinimumGroundTimeMode {
  Minimum,
  Maximum,
  Average
}

export const defaultAutoArrangerOptions: AutoArrangerOptions = {
  minimumGroundTimeMode: MinimumGroundTimeMode.Minimum,
  minimumGroundTimeOffset: 0
};
