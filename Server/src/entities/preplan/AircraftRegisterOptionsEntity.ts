import { XmlArray, xmlArray } from 'src/utils/xml';
import Id from '@core/types/Id';
import AircraftRegisterOptionsStatus from '@core/types/AircraftRegisterOptionsStatus';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';

export default interface AircraftRegisterOptionsEntity {
  readonly Option: XmlArray<{
    readonly _attributes: {
      readonly Id_AircraftRegister: Id;
      readonly Status: AircraftRegisterOptionsStatus;
      readonly BaseAirportId?: Id;
    };
  }>;
}

export function convertAircraftRegisterOptionsModelToEntity(data: AircraftRegisterOptionsModel): AircraftRegisterOptionsEntity {
  return {
    Option: data.options.map(option => ({
      _attributes: {
        Id_AircraftRegister: option.aircraftRegisterId,
        Status: option.status,
        BaseAirportId: option.baseAirportId
      }
    }))
  };
}
export function convertAircraftRegisterOptionsEntityToModel(data: AircraftRegisterOptionsEntity): AircraftRegisterOptionsModel {
  return {
    options: xmlArray(data.Option).map(option => ({
      aircraftRegisterId: option._attributes.Id_AircraftRegister,
      status: option._attributes.Status,
      baseAirportId: option._attributes.BaseAirportId
    }))
  };
}
