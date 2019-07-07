import AircraftSelection from '@core/types/AircraftSelection';
import { FlightScopeModel } from '@core/models/flight/FlightScopeModel';
import FlightTime from './FlightTime';

export default class FlightScope {
  /** In minutes, greater than 0. */ readonly blockTime: number;
  readonly times: readonly FlightTime[];
  readonly aircraftSelection: AircraftSelection;
  readonly slot: boolean;
  readonly slotComment: string;
  readonly required: boolean;

  constructor(raw: FlightScopeModel) {
    this.blockTime = raw.blockTime;
    this.times = raw.times.map(t => new FlightTime(t));
    this.aircraftSelection = raw.aircraftSelection;
    this.slot = raw.slot;
    this.slotComment = raw.slotComment;
    this.required = raw.required;
  }
}
