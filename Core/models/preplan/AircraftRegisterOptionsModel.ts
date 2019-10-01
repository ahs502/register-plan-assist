import AircraftRegisterOptionsStatus from '@core/types/AircraftRegisterOptionsStatus';
import Id from '@core/types/Id';

export default interface AircraftRegisterOptionsModel {
  readonly options: readonly {
    readonly aircraftRegisterId: Id;
    readonly status: AircraftRegisterOptionsStatus;
    readonly baseAirportId?: Id;
  }[];
}
