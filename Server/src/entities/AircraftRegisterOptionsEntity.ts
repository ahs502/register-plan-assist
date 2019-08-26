import AircraftRegisterOptionsModel from '@core/models/AircraftRegisterOptionsModel';
import AircraftRegisterStatus from '@core/types/aircraft-register-options/AircraftRegisterStatus';

export default interface AircraftRegisterOptionsEntity {
  readonly _attributes: {
    readonly Id_AircraftRegister: string;
    readonly Status: string;
    readonly Id_StartingAirport: string;
  };
}

export function convertAircraftRegisterOptionsModelToEntity(data: AircraftRegisterOptionsModel, aircraftRegisterId: string): AircraftRegisterOptionsEntity {
  return {
    _attributes: {
      Id_AircraftRegister: aircraftRegisterId,
      Id_StartingAirport: data.startingAirportId,
      Status: data.status
    }
  };
}

export function convertAircraftRegisterOptionsEntityToModel(data: AircraftRegisterOptionsEntity): AircraftRegisterOptionsModel {
  return {
    startingAirportId: data._attributes.Id_AircraftRegister,
    status: data._attributes.Status as AircraftRegisterStatus
  };
}
