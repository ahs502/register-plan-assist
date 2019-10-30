import Id from '@core/types/Id';
import PreplanHeaderModel from '@core/models/preplan/PreplanHeaderModel';

export default interface PreplanHeaderEntity {
  readonly id: Id;
  readonly name: string;
  readonly published: boolean;
  readonly finalized: boolean;
  readonly userId: Id;
  readonly userName: string;
  readonly userDisplayName: string;
  readonly parentPreplanId: Id | null;
  readonly parentPreplanName: string | null;
  readonly parentPreplanUserId: Id | null;
  readonly parentPreplanUserName: string | null;
  readonly parentPreplanUserDisplayName: string | null;
  readonly creationDateTime: string;
  readonly lastEditDateTime: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly simulationId: Id | null;
  readonly simulationName: string | null;
}

export function convertPreplanHeaderEntityToModel(data: PreplanHeaderEntity): PreplanHeaderModel {
  return {
    id: data.id,
    name: data.name,
    published: data.published,
    finalized: data.finalized,
    user: {
      id: data.userId,
      name: data.userName,
      displayName: data.userDisplayName
    },
    parentPreplan: !data.parentPreplanId
      ? undefined
      : {
          id: data.parentPreplanId,
          name: data.parentPreplanName,
          user: {
            id: data.parentPreplanUserId,
            name: data.parentPreplanUserName,
            displayName: data.parentPreplanUserDisplayName
          }
        },
    creationDateTime: data.creationDateTime,
    lastEditDateTime: data.lastEditDateTime,
    startDate: data.startDate,
    endDate: data.endDate,
    simulation: !data.simulationId
      ? undefined
      : {
          id: data.simulationId,
          name: data.simulationName
        }
  };
}
