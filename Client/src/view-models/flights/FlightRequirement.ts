import FlightRequirementModel from '@core/models/flights/FlightRequirementModel';
import FlightDefinition from './FlightDefinition';
import FlightScope from './FlightScope';
import WeekdayFlightRequirement from './WeekdayFlightRequirement';
import { PreplanAircraftRegisters } from 'src/view-models/PreplanAircraftRegister';

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
}
