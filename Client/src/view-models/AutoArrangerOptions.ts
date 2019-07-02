import { MinimumGroundTimeMode } from '@core/types/auto-arranger-options';

export default interface AutoArrangerOptions {
  readonly minimumGroundTimeMode: MinimumGroundTimeMode;
  /** In minutes. */ readonly minimumGroundTimeOffset: number;
}

export const defaultAutoArrangerOptions: AutoArrangerOptions = {
  minimumGroundTimeMode: 'MINIMUM',
  minimumGroundTimeOffset: 0
};
