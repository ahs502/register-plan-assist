import { FlightScopeModel } from '@core/models/flights/FlightScopeModel';
import PreplanAircraftSelection from 'src/view-models/PreplanAircraftSelection';
import FlightTime from './FlightTime';
import { PreplanAircraftRegisters } from '../PreplanAircraftRegister';
import Rsx from '@core/types/flight-requirement/Rsx';
import DeepOptional from '@core/types/DeepOptional';
import { parseHHMM } from 'src/utils/model-parsers';
import FlightTimeModel from '@core/models/flights/FlightTimeModel';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';

export default class FlightScope {
  /** In minutes, greater than 0. */ readonly blockTime: number;
  readonly times: readonly FlightTime[];
  readonly aircraftSelection: PreplanAircraftSelection;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;
  readonly rsx: Rsx;
  readonly required: boolean;

  constructor(raw: FlightScopeModel, aircraftRegisters: PreplanAircraftRegisters) {
    this.blockTime = raw.blockTime;
    this.times = raw.times.map(t => new FlightTime(t));
    this.aircraftSelection = new PreplanAircraftSelection(raw.aircraftSelection, aircraftRegisters);
    this.originPermission = raw.originPermission;
    this.destinationPermission = raw.destinationPermission;
    this.rsx = raw.rsx;
    this.required = raw.required;
  }

  extractModel(overrides?: DeepOptional<FlightScopeModel>) {
    //TODO: include overrides
  }
}
