import AircraftRegisterStatus from '@core/types/aircraft-register-options/AircraftRegisterStatus';
import AircraftRegisterOptionsModel, { AircraftRegisterOptionsDictionaryModel } from '@core/models/AircraftRegisterOptionsModel';

export default interface AircraftRegisterOptionsEntity {
  readonly Status: string;
  readonly Id_StartingAirport?: string;
  readonly Id_AircraftRegister: string;
}

// export interface AircraftRegisterOptionsDictionaryEntity {
//   readonly [id: string]: AircraftRegisterOptionsEntity;
// }

// export function convertAircraftRegisterOptionsEntityToModel(data: AircraftRegisterOptionsEntity): AircraftRegisterOptionsModel {
//   return {
//     status: data.status,
//     startingAirportId: data.startingAirportId
//   };
// }

// export function convertAircraftRegisterOptionsDictionaryEntityToModel(data: AircraftRegisterOptionsDictionaryEntity): AircraftRegisterOptionsDictionaryModel {
//   const result: any = {};
//   for (const id in data) {
//     result[id] = convertAircraftRegisterOptionsEntityToModel(data[id]);
//   }
//   return result;
// }
