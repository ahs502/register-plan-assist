import IClonable from '../utils/IClonable';
import AircraftSelection from './AircraftSelection';

export interface FlightTime {
  stdLowerBound: number; // In minutes >= 0 (even more than 24 * 60)
  stcUpperBound: number; // In minutes >= 0 (even more than 24 * 60)
}

export default class FlightScope implements IClonable<FlightScope> {
  blockTime: number; // In minutes > 0
  times: FlightTime[];
  aircraftSelection: AircraftSelection;
  isRequired: boolean;

  constructor(blockTime: number, times: FlightTime[], aircraftSelection: AircraftSelection, isRequired: boolean) {
    this.blockTime = blockTime;
    this.times = times;
    this.aircraftSelection = aircraftSelection;
    this.isRequired = isRequired;
  }

  clone(): FlightScope {
    return new FlightScope(this.blockTime, this.times.map(t => ({ ...t })), this.aircraftSelection.clone(), this.isRequired);
  }
}
