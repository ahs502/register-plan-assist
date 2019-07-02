import { MinimumGroundTimeMode } from '@core/types/auto-arranger-options';
import AutoArrangerOptionsModel from '@core/models/AutoArrangerOptionsModel';

export default interface AutoArrangerOptionsEntity {
  readonly minimumGroundTimeMode: MinimumGroundTimeMode;
  readonly minimumGroundTimeOffset: number;
}

export function convertAutoArrangerOptionsEntityToModel(data: AutoArrangerOptionsEntity): AutoArrangerOptionsModel {
  return {
    minimumGroundTimeMode: data.minimumGroundTimeMode,
    minimumGroundTimeOffset: data.minimumGroundTimeOffset
  };
}
