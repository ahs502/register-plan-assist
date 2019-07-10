import { FlightScopeModel } from '@core/models/flight/FlightScopeModel';
import AircraftSelection from 'src/view-models/AircraftSelection';
import FlightTime from './FlightTime';
import { PreplanAircraftRegisters } from '../PreplanAircraftRegister';

export default class FlightScope {
  /** In minutes, greater than 0. */ readonly blockTime: number;
  readonly times: readonly FlightTime[];
  readonly aircraftSelection: AircraftSelection;
  readonly slot: boolean;
  readonly slotComment: string;
  readonly required: boolean;

  constructor(raw: FlightScopeModel, aircraftRegisters: PreplanAircraftRegisters) {
    this.blockTime = raw.blockTime;
    this.times = raw.times.map(t => new FlightTime(t));
    this.aircraftSelection = new AircraftSelection(raw.aircraftSelection, aircraftRegisters);
    this.slot = raw.slot;
    this.slotComment = raw.slotComment;
    this.required = raw.required;
  }
}
