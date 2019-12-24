import Id from '@core/types/Id';
import PreplanHeaderModel from '@core/models/preplan/PreplanHeaderModel';

export default interface PreplanHeaderEntity {
  readonly id: Id;
  readonly name: string;
  readonly published: boolean;
  readonly accepted: boolean;
  readonly userId: Id;
  readonly userName: string;
  readonly userDisplayName: string;
  readonly parentPreplanHeaderId: Id | null;
  readonly parentPreplanHeaderName: string | null;
  readonly parentPreplanHeaderUserId: Id | null;
  readonly parentPreplanHeaderUserName: string | null;
  readonly parentPreplanHeaderUserDisplayName: string | null;
  readonly creationDateTime: string;
  readonly startDate: string;
  readonly endDate: string;
}

export function convertPreplanHeaderEntityToModel(data: PreplanHeaderEntity): PreplanHeaderModel {
  return {
    id: data.id,
    name: data.name,
    published: data.published,
    accepted: data.accepted,
    user: {
      id: data.userId,
      name: data.userName,
      displayName: data.userDisplayName
    },
    parentPreplanHeader: !data.parentPreplanHeaderId
      ? undefined
      : {
          id: data.parentPreplanHeaderId,
          name: data.parentPreplanHeaderName,
          user: {
            id: data.parentPreplanHeaderUserId,
            name: data.parentPreplanHeaderUserName,
            displayName: data.parentPreplanHeaderUserDisplayName
          }
        },
    creationDateTime: data.creationDateTime,
    startDate: data.startDate,
    endDate: data.endDate
  };
}
