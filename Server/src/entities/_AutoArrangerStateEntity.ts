import MessageType from '@core/types/auto-arranger-state/MessageType';
import AutoArrangerStateModel, { MessageModel, ChangeLogModel } from '@core/models/AutoArrangerStateModel';

export interface MessageEntity {
  Type: MessageType;
  Text: string;
}

export interface ChangeLogEntity {
  FlightDerievedId: string;
  OldStd: number;
  Id_OldAircraftRegister?: string;
  NewStd: number;
  Id_NewAircraftRegister?: string;
}

export default interface AutoArrangerStateEntity {
  Solving: boolean;
  SolvingStartDateTime?: string;
  SolvingDuration?: number;
  Message?: string;
  MessageViewed: boolean;
  ChangeLogs: string;
  ChangeLogsViewed: boolean;
}

// export function convertMessageEntityToModel(data: MessageEntity): MessageModel {
//   return {
//     type: data.type,
//     text: data.text
//   };
// }

// export function convertChangeLogEntityToModel(data: ChangeLogEntity): ChangeLogModel {
//   return {
//     flightDerievedId: data.flightDerievedId,
//     oldStd: data.oldStd,
//     oldAircraftRegisterId: data.oldAircraftRegisterId,
//     newStd: data.newStd,
//     newAircraftRegisterId: data.newAircraftRegisterId
//   };
// }

// export function convertAutoArrangerStateEntityToModel(data: AutoArrangerStateEntity): AutoArrangerStateModel {
//   return {
//     solving: data.solving,
//     solvingStartDateTime: data.solvingStartDateTime ? data.solvingStartDateTime.toJSON() : undefined,
//     solvingDuration: data.solvingDuration,
//     message: data.message ? convertMessageEntityToModel(data.message) : undefined,
//     messageViewed: data.messageViewed,
//     changeLogs: data.changeLogs.map(convertChangeLogEntityToModel),
//     changeLogsViewed: data.changeLogsViewed
//   };
// }
