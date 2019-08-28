import FlightRequirementModel from '@core/models/flights/FlightRequirementModel';
import FlightDefinition from './FlightDefinition';
import FlightScope from './FlightScope';
import WeekdayFlightRequirement from './WeekdayFlightRequirement';
import { PreplanAircraftRegisters } from 'src/view-models/PreplanAircraftRegister';
import DeepOptional from '@core/types/DeepOptional';
import { FlightScopeModel } from '@core/models/flights/FlightScopeModel';
import { parseHHMM, parseAirport } from 'src/utils/model-parsers';
import FlightTimeModel from '@core/models/flights/FlightTimeModel';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';
import PreplanAircraftSelection from '../PreplanAircraftSelection';
import FlightModel from '@core/models/flights/FlightModel';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';

export default class FlightRequirement {
  readonly id: string;
  readonly definition: FlightDefinition;
  readonly scope: FlightScope;
  readonly days: readonly WeekdayFlightRequirement[];
  readonly ignored: boolean;

  constructor(raw: FlightRequirementModel, aircraftRegisters: PreplanAircraftRegisters) {
    this.id = raw.id!;
    this.definition = new FlightDefinition(raw.definition);
    this.scope = new FlightScope(raw.scope, aircraftRegisters);
    this.days = raw.days.map(d => new WeekdayFlightRequirement(d, this, aircraftRegisters)).sortBy(d => d.day);
    this.ignored = raw.ignored;
  }

  /**
   * Gets the day flight requirement of the specified day.
   * @param day The day of the period.
   */
  getDay(day: number): WeekdayFlightRequirement | undefined {
    return this.days.find(d => d.day === day);
  }

  extractModel(overrides?: DeepOptional<FlightRequirementModel>) {
    //TODO: impement
  }
}
