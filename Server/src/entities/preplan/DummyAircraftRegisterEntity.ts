import Id from '@core/types/Id';
import DummyAircraftRegisterModel from '@core/models/preplan/DummyAircraftRegisterModel';
import { xmlEscape } from 'src/utils/xml';

export default interface DummyAircraftRegisterEntity {
  readonly _attributes: {
    readonly Id: Id;
    readonly Name: string;
    readonly Id_AircraftType: Id;
  };
}

export function convertDummyAircraftRegisterModelToEntity(data: DummyAircraftRegisterModel): DummyAircraftRegisterEntity {
  return {
    _attributes: {
      Id: data.id,
      Name: xmlEscape(data.name),
      Id_AircraftType: data.aircraftTypeId
    }
  };
}
export function convertDummyAircraftRegisterEntityToModel(data: DummyAircraftRegisterEntity): DummyAircraftRegisterModel {
  return {
    id: data._attributes.Id,
    name: data._attributes.Name,
    aircraftTypeId: data._attributes.Id_AircraftType
  };
}
