import { MessageType } from '@core/types/auto-arranger-state';
import AutoArrangerStateModel from '@core/models/AutoArrangerStateModel';

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
  message: {
    type: MessageType;
    text: string;
  };
  messageViewed: boolean;
  changeLogs: readonly ChangeLogEntity[];
  changeLogsViewed: boolean;
}

export function convertAutoArrangerStateEntityToModel(data: AutoArrangerStateEntity): AutoArrangerStateModel {
  return {
    solving: data.solving,
    solvingStartDateTime: data.solvingStartDateTime ? data.solvingStartDateTime.toJSON() : undefined,
    solvingDuration: data.solvingDuration,
    message: {
      type: data.message.type,
      text: data.message.text
    },
    messageViewed: data.messageViewed,
    changeLogs: data.changeLogs.map(l => ({
      flightDerievedId: l.flightDerievedId,
      oldStd: l.oldStd,
      oldAircraftRegisterId: l.oldAircraftRegisterId,
      newStd: l.newStd,
      newAircraftRegisterId: l.newAircraftRegisterId
    })),
    changeLogsViewed: data.changeLogsViewed
  };
}
