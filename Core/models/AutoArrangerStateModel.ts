import { MessageType } from '../types/auto-arranger-state';

export interface ChangeLogModel {
  flightDerievedId: string;
  oldStd: number;
  oldAircraftRegisterId?: string;
  newStd: number;
  newAircraftRegisterId?: string;
}

export default interface AutoArrangerStateModel {
  solving: boolean;
  solvingStartDateTime?: string;
  solvingDuration?: number;
  message: {
    type: MessageType;
    text: string;
  };
  messageViewed: boolean;
  changeLogs: readonly ChangeLogModel[];
  changeLogsViewed: boolean;
}
