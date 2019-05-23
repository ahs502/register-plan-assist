import IClonable from '../utils/IClonable';
import AircraftSelection from './AircraftSelection';
import { Daytime } from './Daytime';

/**
 * A data structure describing the possible lower and upper bounds of the STD of some flight.
 */
export interface FlightTime {
  stdLowerBound: Daytime;
  stdUpperBound: Daytime;
}

/**
 * Defines the scope of the time, the aircraft register and the slot of a flight.
 */
export default class FlightScope implements IClonable<FlightScope> {
  blockTime: number; // In minutes > 0
  times: FlightTime[];
  aircraftSelection: AircraftSelection;
  slot: boolean;
  slotComments: string;
  required: boolean;

  constructor(blockTime: number, times: FlightTime[], aircraftSelection: AircraftSelection, slot: boolean, slotComments: string, required: boolean) {
    this.blockTime = blockTime;
    this.times = times;
    this.aircraftSelection = aircraftSelection;
    this.slot = slot;
    this.slotComments = slotComments;
    this.required = required;
  }

  clone(): FlightScope {
    return new FlightScope(this.blockTime, this.times.map(t => ({ ...t })), this.aircraftSelection.clone(), this.slot, this.slotComments, this.required);
  }
}
