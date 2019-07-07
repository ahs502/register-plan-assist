import MessageType from '@core/types/auto-arranger-state/MessageType';

export interface MessageModel {
  readonly type: MessageType;
  readonly text: string;
}

export interface ChangeLogModel {
  readonly flightDerievedId: string;
  readonly oldStd: number;
  readonly oldAircraftRegisterId?: string;
  readonly newStd: number;
  readonly newAircraftRegisterId?: string;
}

export default interface AutoArrangerStateModel {
  readonly solving: boolean;
  readonly solvingStartDateTime?: string;
  readonly solvingDuration?: number;
  readonly message?: MessageModel;
  readonly messageViewed: boolean;
  readonly changeLogs: readonly ChangeLogModel[];
  readonly changeLogsViewed: boolean;
}
