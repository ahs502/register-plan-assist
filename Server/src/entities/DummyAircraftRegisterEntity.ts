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

export interface DummyAircraftRegisterListEntity {
  readonly DummyAircraftRegisters: readonly DummyAircraftRegisterEntity[];
}
export function convertDummyAircraftRegisterListModelToEntity(data: readonly DummyAircraftRegisterModel[]): DummyAircraftRegisterListEntity {
  return {
    DummyAircraftRegisters: data.map(convertDummyAircraftRegisterModelToEntity)
  };
}
export function convertDummyAircraftRegisterListEntityToModel(data: DummyAircraftRegisterListEntity): readonly DummyAircraftRegisterModel[] {
  return data.DummyAircraftRegisters.map(convertDummyAircraftRegisterEntityToModel);
}
