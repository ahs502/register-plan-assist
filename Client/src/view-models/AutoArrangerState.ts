import Daytime from '@core/types/Daytime';
import MessageType from '@core/types/auto-arranger-state/MessageType';
import AutoArrangerStateModel, { ChangeLogModel, MessageModel } from '@core/models/AutoArrangerStateModel';
import Flight from './flight/Flight';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from './PreplanAircraftRegister';

export class Message {
  readonly type: MessageType;
  readonly text: string;

  constructor(raw: MessageModel) {
    this.type = raw.type;
    this.text = raw.text;
  }
}

export class ChangeLog {
  readonly flight: Flight;
  readonly oldStd: Daytime;
  readonly oldAircraftRegister?: PreplanAircraftRegister;
  readonly newStd: Daytime;
  readonly newAircraftRegister?: PreplanAircraftRegister;

  constructor(raw: ChangeLogModel, aircraftRegisters: PreplanAircraftRegisters, flights: readonly Flight[]) {
    this.flight = flights.find(f => f.derivedId === raw.flightDerievedId)!;
    this.oldStd = new Daytime(raw.oldStd);
    this.oldAircraftRegister = raw.oldAircraftRegisterId ? aircraftRegisters.id[raw.oldAircraftRegisterId] : undefined;
    this.newStd = new Daytime(raw.newStd);
    this.newAircraftRegister = raw.newAircraftRegisterId ? aircraftRegisters.id[raw.newAircraftRegisterId] : undefined;
  }
}

export default class AutoArrangerState {
  readonly solving: boolean;
  readonly solvingStartDateTime?: Date;
  /** In minutes */ readonly solvingDuration?: number;
  readonly message?: Message;
  readonly messageViewed: boolean;
  readonly changeLogs: readonly ChangeLog[];
  readonly changeLogsViewed: boolean;

  constructor(raw: AutoArrangerStateModel, aircraftRegisters: PreplanAircraftRegisters, flights: readonly Flight[]) {
    this.solving = raw.solving;
    this.solvingStartDateTime = raw.solvingStartDateTime ? new Date(raw.solvingStartDateTime) : undefined;
    this.solvingDuration = raw.solvingDuration;
    this.message = raw.message ? new Message(raw.message) : undefined;
    this.messageViewed = raw.messageViewed;
    this.changeLogs = raw.changeLogs.filter(l => flights.some(f => f.derivedId === l.flightDerievedId)).map(l => new ChangeLog(l, aircraftRegisters, flights));
    this.changeLogsViewed = raw.changeLogsViewed;
  }
}
