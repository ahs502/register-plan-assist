import AutoArrangerOptionsModel from '@core/models/AutoArrangerOptionsModel';
import MinimumGroundTimeMode from '@core/types/auto-arranger-options/MinimumGroundTimeMode';

export default interface AutoArrangerOptionsEntity {
  readonly MinimumGroundTimeMode: MinimumGroundTimeMode;
  readonly MinimumGroundTimeOffset: number;
}

// export function convertAutoArrangerOptionsEntityToModel(data: AutoArrangerOptionsEntity): AutoArrangerOptionsModel {
//   return {
//     minimumGroundTimeMode: data.minimumGroundTimeMode,
//     minimumGroundTimeOffset: data.minimumGroundTimeOffset
//   };
// }
