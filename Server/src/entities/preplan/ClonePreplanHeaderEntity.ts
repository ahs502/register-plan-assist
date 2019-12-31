import NewPreplanHeaderEntity, { convertNewPreplanHeaderModelToEntity } from 'src/entities/preplan/NewPreplanHeaderEntity';
import Id from '@core/types/Id';
import ClonePreplanHeaderModel from '@core/models/preplan/ClonePreplanHeaderModel';

export default interface ClonePreplanHeaderEntity extends NewPreplanHeaderEntity {
  readonly sourcePreplanId: Id;
  readonly includeChanges: boolean;
  readonly includeAllVersions: boolean;
}

export function convertClonePreplanHeaderModelToEntity(data: ClonePreplanHeaderModel): ClonePreplanHeaderEntity {
  return {
    ...convertNewPreplanHeaderModelToEntity(data),
    sourcePreplanId: data.sourcePreplanId,
    includeChanges: data.includeChanges,
    includeAllVersions: data.includeAllVersions
  };
}
