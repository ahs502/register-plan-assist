import DummyAircraftRegisterModel from '@core/models/DummyAircraftRegisterModel';

export default interface DummyAircraftRegisterEntity {
  readonly id: string;
  readonly name: string;
  readonly aircraftTypeId: string;
}

export function convertDummyAircraftRegisterEntityToModel(data: DummyAircraftRegisterEntity): DummyAircraftRegisterModel {
  return {
    id: data.id,
    name: data.name,
    aircraftTypeId: data.aircraftTypeId
  };
}
