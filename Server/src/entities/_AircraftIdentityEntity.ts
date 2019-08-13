import AircraftIdentityType from '@core/types/aircraft-identity/AircraftIdentityType';

export default interface AircraftIdentityEntity {
  readonly Type: AircraftIdentityType;
  readonly Name: string; // =>remove
  readonly EntityId: string;
}

// export function convertAircraftIdentityEntityToModel(data: AircraftIdentityEntity): AircraftIdentityModel {
//   return {
//     type: data.type,
//     name: data.name,
//     entityId: data.entityId
//   };
// }
