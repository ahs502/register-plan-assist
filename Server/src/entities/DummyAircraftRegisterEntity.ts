import DummyAircraftRegisterModel from '@core/models/DummyAircraftRegisterModel';

export default interface DummyAircraftRegisterEntity {
  readonly _attributes: {
    readonly Id: string;
    readonly Name: string;
    readonly Id_AircraftType: string;
  };
}

export function convertDummyAircraftRegisterModelToEntity(data: DummyAircraftRegisterModel): DummyAircraftRegisterEntity {
  return {
    _attributes: {
      Id: data.id,
      Id_AircraftType: data.aircraftTypeId,
      Name: data.name
    }
  };
}

export function convertDummyAircraftRegisterEntityToModel(data: DummyAircraftRegisterEntity): DummyAircraftRegisterModel {
  return {
    id: data._attributes.Id,
    aircraftTypeId: data._attributes.Id_AircraftType,
    name: data._attributes.Name
  };
}
