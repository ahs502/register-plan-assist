import Id from '@core/types/Id';
import PreplanHeaderDataModel from '@core/models/preplan/PreplanHeaderDataModel';
import PreplanHeaderEntity, { convertPreplanHeaderEntityToModel } from 'src/entities/preplan/PreplanHeaderEntity';

export default interface PreplanHeaderDataEntity extends PreplanHeaderEntity {
  readonly currentId: Id;
  readonly currentLastEditDateTime: string;
  readonly currentSimulationId: Id | null;
  readonly currentSimulationName: string | null;
}

export function convertPreplanHeaderDataEntityToModel(data: PreplanHeaderDataEntity): PreplanHeaderDataModel {
  return {
    ...convertPreplanHeaderEntityToModel(data),
    current: {
      id: data.currentId,
      lastEditDateTime: data.currentLastEditDateTime,
      simulation: !data.currentSimulationId
        ? undefined
        : {
            id: data.currentSimulationId,
            name: data.currentSimulationName
          }
    }
  };
}
