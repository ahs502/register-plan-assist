import { FlightScopeModel } from '@core/models/flights/FlightScopeModel';
import PreplanAircraftSelection from 'src/view-models/PreplanAircraftSelection';
import FlightTime from './FlightTime';
import { PreplanAircraftRegisters } from '../PreplanAircraftRegister';
import Rsx from '@core/types/flight-requirement/Rsx';

export default class FlightScope {
  /** In minutes, greater than 0. */ readonly blockTime: number;
  readonly times: readonly FlightTime[];
  readonly aircraftSelection: PreplanAircraftSelection;
  readonly departurePermission: boolean;
  readonly arrivalPermission: boolean;
  readonly rsx: Rsx;
  readonly required: boolean;

  constructor(raw: FlightScopeModel, aircraftRegisters: PreplanAircraftRegisters) {
    this.blockTime = raw.blockTime;
    this.times = raw.times.map(t => new FlightTime(t));
    this.aircraftSelection = new PreplanAircraftSelection(raw.aircraftSelection, aircraftRegisters);
    this.departurePermission = raw.departurePermission;
    this.arrivalPermission = raw.arrivalPermission;
    this.rsx = raw.rsx;
    this.required = raw.required;
  }
}