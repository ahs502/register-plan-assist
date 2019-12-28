import NewPreplanHeaderEntity, { convertNewPreplanHeaderModelToEntity } from 'src/entities/preplan/NewPreplanHeaderEntity';
import Id from '@core/types/Id';
import EditPreplanHeaderModel from '@core/models/preplan/EditPreplanHeaderModel';

export default interface EditPreplanHeaderEntity extends NewPreplanHeaderEntity {
  readonly id: Id;
}

export function convertEditPreplanHeaderModelToEntity(data: EditPreplanHeaderModel): EditPreplanHeaderEntity {
  return {
    ...convertNewPreplanHeaderModelToEntity(data),
    id: data.id
  };
}
