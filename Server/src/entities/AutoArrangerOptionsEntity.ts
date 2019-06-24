import { MinimumGroundTimeMode } from '@core/types/auto-arranger-options';

export default interface AutoArrangerOptionsEntity {
  readonly minimumGroundTimeMode: MinimumGroundTimeMode;
  readonly minimumGroundTimeOffset: number;
}
