import FlightRequirement from './FlightRequirement';
import FlightScope from './FlightScope';
import Flight from './Flight';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';
import { PreplanAircraftRegisters } from 'src/view-models/PreplanAircraftRegister';
import FlightDefinition from './FlightDefinition';

export default class WeekdayFlightRequirement {
  readonly requirement: FlightRequirement;
  readonly derivedId: string;
  readonly scope: FlightScope;
  readonly notes: string;
  readonly day: number;
  readonly flight: Flight;

  constructor(raw: WeekdayFlightRequirementModel, requirement: FlightRequirement, aircraftRegisters: PreplanAircraftRegisters) {
    this.derivedId = `${requirement.id}#${raw.day}`;
    this.requirement = requirement;
    this.scope = new FlightScope(raw.scope, aircraftRegisters);
    this.notes = raw.notes;
    this.day = raw.day;
    this.flight = new Flight(raw.flight, this, aircraftRegisters);
  }

  get definition(): FlightDefinition {
    return this.requirement.definition;
  }
}
