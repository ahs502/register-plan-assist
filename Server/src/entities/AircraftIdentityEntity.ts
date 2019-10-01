import AircraftIdentityModel from '@core/models/AircraftIdentityModel';
import AircraftIdentityType from '@core/types/AircraftIdentityType';
import Id from '@core/types/Id';

export default interface AircraftIdentityEntity {
  readonly _attributes: {
    readonly Type: string;
    readonly Id_Entity: Id;
  };
}

export function convertAircraftIdentityModelToEntity(data: AircraftIdentityModel): AircraftIdentityEntity {
  return {
    _attributes: {
      Type: data.type,
      Id_Entity: data.entityId
    }
  };
}

export function convertAircraftIdentityEntityToModel(data: AircraftIdentityEntity): AircraftIdentityModel {
  return {
    type: data._attributes.Type as AircraftIdentityType,
    entityId: data._attributes.Id_Entity
  };
}
