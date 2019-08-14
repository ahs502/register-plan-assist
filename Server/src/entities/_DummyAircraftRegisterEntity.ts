import DummyAircraftRegisterModel from '@core/models/DummyAircraftRegisterModel';

export default interface DummyAircraftRegisterEntity {
  readonly Id: string;
  readonly Name: string;
  readonly AircraftTypeId: string;
}

// export function convertDummyAircraftRegisterEntityToModel(data: DummyAircraftRegisterEntity): DummyAircraftRegisterModel {
//   return {
//     id: data.id,
//     name: data.name,
//     aircraftTypeId: data.aircraftTypeId
//   };
// }
