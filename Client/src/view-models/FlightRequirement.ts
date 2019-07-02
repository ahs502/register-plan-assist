import Daytime from '@core/types/Daytime';
import AircraftSelection from '@core/types/AircraftSelection';
import FlightRequirementModel, { FlightModel, WeekdayFlightRequirementModel } from '@core/models/FlightRequirementModel';

export interface FlightDefinition {
  readonly label: string;
  readonly stcId: string;
  readonly flightNumber: string;
  readonly departureAirportId: string;
  readonly arrivalAirportId: string;
}

export interface FlightTime {
  /** In minutes. */ readonly stdLowerBound: Daytime;
  /** In minutes. */ readonly stdUpperBound: Daytime;
}

export interface FlightScope {
  /** In minutes, greater than 0. */ readonly blockTime: number;
  readonly times: readonly FlightTime[];
  readonly aircraftSelection: AircraftSelection;
  readonly slot: boolean;
  readonly slotComment: string;
  readonly required: boolean;
}

export class Flight {
  readonly weekdayRequirement: WeekdayFlightRequirement;
  readonly std: Daytime;
  readonly aircraftRegisterId?: string;

  constructor(raw: FlightModel, weekdayRequiremnet: WeekdayFlightRequirement) {
    this.weekdayRequirement = weekdayRequiremnet;
    this.std = new Daytime(raw.std);
    this.aircraftRegisterId = raw.aircraftRegisterId;
  }

  get derivedId(): string {
    return this.weekdayRequirement.derivedId;
  }
  get requirement(): FlightRequirement {
    return this.weekdayRequirement.requirement;
  }
}

export class WeekdayFlightRequirement {
  readonly requirement: FlightRequirement;
  readonly derivedId: string;
  readonly scope: FlightScope;
  readonly notes: string;
  readonly day: number;
  readonly flight: Flight;

  constructor(raw: WeekdayFlightRequirementModel, requirement: FlightRequirement) {
    this.derivedId = `${requirement.id}#${raw.day}`;
    this.requirement = requirement;
    this.scope = {
      ...raw.scope,
      times: raw.scope.times.map(t => ({
        stdLowerBound: new Daytime(t.stdLowerBound),
        stdUpperBound: new Daytime(t.stdUpperBound)
      }))
    };
    this.notes = raw.notes;
    this.day = raw.day;
    this.flight = new Flight(raw.flight, this);
  }

  get definition(): FlightDefinition {
    return this.requirement.definition;
  }
}

export default class FlightRequirement {
  readonly id: string;
  readonly definition: FlightDefinition;
  readonly scope: FlightScope;
  readonly days: readonly WeekdayFlightRequirement[];
  readonly ignored: boolean;

  constructor(raw: FlightRequirementModel) {
    this.id = raw.id;
    this.definition = raw.definition;
    this.scope = {
      ...raw.scope,
      times: raw.scope.times.map(t => ({
        stdLowerBound: new Daytime(t.stdLowerBound),
        stdUpperBound: new Daytime(t.stdUpperBound)
      }))
    };
    this.days = raw.days.map(d => new WeekdayFlightRequirement(d, this)).sortBy(d => d.day);
    this.ignored = raw.ignored;
  }

  /**
   * Gets the day flight requirement of the specified day.
   * @param day The day of the period.
   */
  get(day: number): WeekdayFlightRequirement | undefined {
    return this.days.find(d => d.day === day);
  }
}
