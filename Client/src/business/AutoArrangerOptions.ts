import MinimumGroundTimeMode from '@core/types/auto-arranger-options/MinimumGroundTimeMode';
import AutoArrangerOptionsModel from '@core/models/AutoArrangerOptionsModel';

export default class AutoArrangerOptions {
  readonly minimumGroundTimeMode: MinimumGroundTimeMode;
  /** In minutes. */ readonly minimumGroundTimeOffset: number;

  constructor(raw: AutoArrangerOptionsModel) {
    this.minimumGroundTimeMode = raw.minimumGroundTimeMode;
    this.minimumGroundTimeOffset = raw.minimumGroundTimeOffset;
  }

  static default = new AutoArrangerOptions({
    minimumGroundTimeMode: 'MINIMUM',
    minimumGroundTimeOffset: 0
  });
}
