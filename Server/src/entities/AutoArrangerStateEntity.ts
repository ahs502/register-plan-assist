import MessageType from '@core/types/auto-arranger-state/MessageType';
import AutoArrangerStateModel, { MessageModel, ChangeLogModel } from '@core/models/AutoArrangerStateModel';

export interface MessageEntity {
  type: MessageType;
  text: string;
}

export interface ChangeLogEntity {
  flightDerievedId: string;
  oldStd: number;
  oldAircraftRegisterId?: string;
  newStd: number;
  newAircraftRegisterId?: string;
}

export default interface AutoArrangerStateEntity {
  solving: boolean;
  solvingStartDateTime?: Date;
  solvingDuration?: number;
  message?: MessageEntity;
  messageViewed: boolean;
  changeLogs: readonly ChangeLogEntity[];
  changeLogsViewed: boolean;
}

export function convertMessageEntityToModel(data: MessageEntity): MessageModel {
  return {
    type: data.type,
    text: data.text
  };
}

export function convertChangeLogEntityToModel(data: ChangeLogEntity): ChangeLogModel {
  return {
    flightDerievedId: data.flightDerievedId,
    oldStd: data.oldStd,
    oldAircraftRegisterId: data.oldAircraftRegisterId,
    newStd: data.newStd,
    newAircraftRegisterId: data.newAircraftRegisterId
  };
}

export function convertAutoArrangerStateEntityToModel(data: AutoArrangerStateEntity): AutoArrangerStateModel {
  return {
    solving: data.solving,
    solvingStartDateTime: data.solvingStartDateTime ? data.solvingStartDateTime.toJSON() : undefined,
    solvingDuration: data.solvingDuration,
    message: data.message ? convertMessageEntityToModel(data.message) : undefined,
    messageViewed: data.messageViewed,
    changeLogs: data.changeLogs.map(convertChangeLogEntityToModel),
    changeLogsViewed: data.changeLogsViewed
  };
}
