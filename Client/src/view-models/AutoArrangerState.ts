import { MessageType } from '@core/types/auto-arranger-state';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister from './PreplanAircraftRegister';

export default interface AutoArrangerState {
  solving: boolean;
  solvingStartDateTime?: Date;
  /** In minutes */ solvingDuration?: number;
  message: {
    type: MessageType;
    text: string;
  };
  messageViewed: boolean;
  changeLogs: readonly {
    flightDerievedId: string;
    oldStd: Daytime;
    oldAircraftRegister?: PreplanAircraftRegister;
    newStd: Daytime;
    newAircraftRegister?: PreplanAircraftRegister;
  }[];
  changeLogsViewed: boolean;
}
