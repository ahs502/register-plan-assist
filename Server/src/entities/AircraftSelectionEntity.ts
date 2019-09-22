import AircraftIdentityEntity, { convertAircraftIdentityModelToEntity, convertAircraftIdentityEntityToModel } from './AircraftIdentityEntity';
import { XmlArray, xmlArray } from 'src/utils/xml';
import AircraftSelectionModel from '@core/models/AircraftSelectionModel';

export default interface AircraftSelectionEntity {
  readonly AllowedIdentities: {
    readonly AllowedIdentity: XmlArray<AircraftIdentityEntity>;
  };
  readonly ForbiddenIdentities: {
    readonly ForbiddenIdentity: XmlArray<AircraftIdentityEntity>;
  };
}

export function convertAircraftSelectionModelToEntity(data: AircraftSelectionModel): AircraftSelectionEntity {
  return {
    AllowedIdentities: {
      AllowedIdentity: data.allowedIdentities.map(convertAircraftIdentityModelToEntity)
    },
    ForbiddenIdentities: {
      ForbiddenIdentity: data.forbiddenIdentities.map(convertAircraftIdentityModelToEntity)
    }
  };
}

export function convertAircraftSelectionEntityToModel(data: AircraftSelectionEntity): AircraftSelectionModel {
  return {
    allowedIdentities: xmlArray(data.AllowedIdentities.AllowedIdentity).map(convertAircraftIdentityEntityToModel),
    forbiddenIdentities: xmlArray(data.ForbiddenIdentities.ForbiddenIdentity).map(convertAircraftIdentityEntityToModel)
  };
}
