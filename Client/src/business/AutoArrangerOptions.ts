export default interface AutoArrangerOptions {
  minimumGroundTimeMode: MinimumGroundTimeMode;
  minimumGroundTimeOffset: number;
}

export type MinimumGroundTimeMode = 'MINIMUM' | 'MAXIMUM' | 'AVERAGE';

export const defaultAutoArrangerOptions: Readonly<AutoArrangerOptions> = {
  minimumGroundTimeMode: 'MINIMUM',
  minimumGroundTimeOffset: 0
};
