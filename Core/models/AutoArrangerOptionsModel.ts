import { MinimumGroundTimeMode } from '../types/auto-arranger-options';

export default interface AutoArrangerOptionsModel {
  readonly minimumGroundTimeMode: MinimumGroundTimeMode;
  readonly minimumGroundTimeOffset: number;
}
