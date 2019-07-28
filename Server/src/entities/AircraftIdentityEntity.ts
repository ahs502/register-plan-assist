import AircraftIdentityType from '@core/types/aircraft-identity/AircraftIdentityType';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';

export default interface AircraftIdentityEntity {
  readonly type: AircraftIdentityType;
  readonly entityId: string;
}

export function convertAircraftIdentityEntityToModel(data: AircraftIdentityEntity): AircraftIdentityModel {
  return {
    type: data.type,
    entityId: data.entityId
  };
}
