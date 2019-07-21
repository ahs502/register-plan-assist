import { FlightScopeModel } from '@core/models/flights/FlightScopeModel';
import PreplanAircraftSelection from 'src/view-models/PreplanAircraftSelection';
import FlightTime from './FlightTime';
import { PreplanAircraftRegisters } from '../PreplanAircraftRegister';

export default class FlightScope {
  /** In minutes, greater than 0. */ readonly blockTime: number;
  readonly times: readonly FlightTime[];
  readonly aircraftSelection: PreplanAircraftSelection;
  readonly slot: boolean;
  readonly slotComment: string;
  readonly required: boolean;

  constructor(raw: FlightScopeModel, aircraftRegisters: PreplanAircraftRegisters) {
    this.blockTime = raw.blockTime;
    this.times = raw.times.map(t => new FlightTime(t));
    this.aircraftSelection = new PreplanAircraftSelection(raw.aircraftSelection, aircraftRegisters);
    this.slot = raw.slot;
    this.slotComment = raw.slotComment;
    this.required = raw.required;
  }
}
