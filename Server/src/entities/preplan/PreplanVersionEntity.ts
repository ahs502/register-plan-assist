import Id from '@core/types/Id';
import PreplanVersionModel from '@core/models/preplan/PreplanVersionModel';

export default interface PreplanVersionEntity {
  readonly id: Id;

  readonly current: boolean;
  readonly lastEditDateTime: string;
  readonly description: string;

  readonly simulationId?: Id;
  readonly simulationName?: string;
}

export function convertPreplanVersionEntityToModel(data: PreplanVersionEntity): PreplanVersionModel {
  return {
    id: data.id,
    current: data.current,
    lastEditDateTime: new Date(data.lastEditDateTime).toJSON(),
    description: data.description,
    simulation: !data.simulationId
      ? undefined
      : {
          id: data.simulationId,
          name: data.simulationName
        }
  };
}
