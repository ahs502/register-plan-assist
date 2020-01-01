import Id from '@core/types/Id';
import PreplanHeaderDataModel from '@core/models/preplan/PreplanHeaderDataModel';
import PreplanHeaderEntity, { convertPreplanHeaderEntityToModel } from 'src/entities/preplan/PreplanHeaderEntity';
import { convertPreplanVersionEntityToModel } from 'src/entities/preplan/PreplanVersionEntity';

export default interface PreplanHeaderVersionEntity extends PreplanHeaderEntity {
  readonly versionId: Id;

  readonly versionCurrent: boolean;
  readonly versionLastEditDateTime: string;
  readonly versionDescription: string;

  readonly versionSimulationId?: Id;
  readonly versionSimulationName?: string;
}

export function convertPreplanHeaderVersionEntitiesToDataModels(data: readonly PreplanHeaderVersionEntity[]): PreplanHeaderDataModel[] {
  return Object.values(data.groupBy('id')).map<PreplanHeaderDataModel>(p => ({
    ...convertPreplanHeaderEntityToModel(p[0]),
    versions: p.map(v =>
      convertPreplanVersionEntityToModel({
        id: v.versionId,
        current: v.versionCurrent,
        lastEditDateTime: v.versionLastEditDateTime,
        description: v.versionDescription,
        simulationId: v.versionSimulationId,
        simulationName: v.versionSimulationName
      })
    )
  }));
}
