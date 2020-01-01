import PreplanHeaderModel from '@core/models/preplan/PreplanHeaderModel';
import PreplanVersionModel from '@core/models/preplan/PreplanVersionModel';

export default interface PreplanHeaderDataModel extends PreplanHeaderModel {
  readonly versions: readonly PreplanVersionModel[];
}
