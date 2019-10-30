import { XmlArray, xmlArray } from 'src/utils/xml';
import AircraftIdentityEntity, { convertAircraftIdentityModelToEntity, convertAircraftIdentityEntityToModel } from './AircraftIdentityEntity';
import AircraftSelectionModel from '@core/models/AircraftSelectionModel';

export default interface AircraftSelectionEntity {
  readonly IncludedIdentities: {
    readonly Identity: XmlArray<AircraftIdentityEntity>;
  };
  readonly ExcludedIdentities: {
    readonly Identity: XmlArray<AircraftIdentityEntity>;
  };
}

export function convertAircraftSelectionModelToEntity(data: AircraftSelectionModel): AircraftSelectionEntity {
  return {
    IncludedIdentities: {
      Identity: data.includedIdentities.map(convertAircraftIdentityModelToEntity)
    },
    ExcludedIdentities: {
      Identity: data.excludedIdentities.map(convertAircraftIdentityModelToEntity)
    }
  };
}

export function convertAircraftSelectionEntityToModel(data: AircraftSelectionEntity): AircraftSelectionModel {
  return {
    includedIdentities: xmlArray(data.IncludedIdentities.Identity).map(convertAircraftIdentityEntityToModel),
    excludedIdentities: xmlArray(data.ExcludedIdentities.Identity).map(convertAircraftIdentityEntityToModel)
  };
}
