import { MessageType } from '../types/auto-arranger-state';

export default interface AutoArrangerStateModel {
  solving: boolean;
  solvingStartDateTime?: string;
  solvingDuration?: number;
  message: {
    type: MessageType;
    text: string;
  };
  messageViewed: boolean;
  changeLogs: readonly {
    flightDerievedId: string;
    oldStd: number;
    oldAircraftRegisterId?: string;
    newStd: number;
    newAircraftRegisterId?: string;
  }[];
  changeLogsViewed: boolean;
}
