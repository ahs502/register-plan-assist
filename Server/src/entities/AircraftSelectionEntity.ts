import AircraftIdentityEntity, { convertAircraftIdentityEntityToModel } from './AircraftIdentityEntity';
import AircraftSelectionModel from '@core/models/AircraftSelectionModel';

export default interface AircraftSelectionEntity {
  readonly allowedIdentities: readonly AircraftIdentityEntity[];
  readonly forbiddenIdentities: readonly AircraftIdentityEntity[];
}

export function convertAircraftSelectionEnitityToModel(data: AircraftSelectionEntity): AircraftSelectionModel {
  return {
    allowedIdentities: data.allowedIdentities.map(convertAircraftIdentityEntityToModel),
    forbiddenIdentities: data.forbiddenIdentities.map(convertAircraftIdentityEntityToModel)
  };
}
