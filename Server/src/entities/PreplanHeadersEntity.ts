import { PreplanHeaderModel } from '@core/models/PreplanModel';

export interface PreplanHeaderEntity {
  readonly id: string;
  readonly name: string;
  readonly published: boolean;
  readonly finalized: boolean;
  readonly userId: string;
  readonly userName: string;
  readonly userDisplayName: string;
  readonly parentPreplanId?: string;
  readonly parentPreplanName?: string;
  readonly creationDateTime: string;
  readonly lastEditDateTime: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly simulationId?: string;
  readonly simulationName?: string;
}

export function convertPreplanHeaderEntityToModel(data: PreplanHeaderEntity): PreplanHeaderModel {
  return {
    id: data.id,
    name: data.name,
    published: data.published,
    finalized: data.finalized,
    userId: data.userId,
    userName: data.userName,
    userDisplayName: data.userDisplayName,
    parentPreplanId: data.parentPreplanId,
    parentPreplanName: data.parentPreplanName,
    creationDateTime: data.creationDateTime,
    lastEditDateTime: data.lastEditDateTime,
    startDate: data.startDate,
    endDate: data.endDate,
    simulationId: data.simulationId,
    simulationName: data.simulationName
  };
}
