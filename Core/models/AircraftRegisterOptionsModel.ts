import AircraftRegisterStatus from '@core/types/aircraft-register-options/AircraftRegisterStatus';

export default interface AircraftRegisterOptionsModel {
  readonly status: AircraftRegisterStatus;
  readonly startingAirportId?: string;
}

export interface AircraftRegisterOptionsDictionaryModel {
  readonly [id: string]: AircraftRegisterOptionsModel;
}
