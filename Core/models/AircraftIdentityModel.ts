import AircraftIdentityType, { AircraftIdentityTypes } from '@core/types/AircraftIdentityType';
import Id from '@core/types/Id';

export default interface AircraftIdentityModel {
  readonly type: AircraftIdentityType;
  readonly entityId: Id;
}
