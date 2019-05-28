import { Daytime } from './Daytime';
import AircraftSelection from './master-data/AircraftSelection';

/**
 * Describes the headline definitions of a flight.
 */
export interface FlightDefinition {
  label: string;
  flightNumber: string;
  departureAirportId: string;
  arrivalAirportId: string;
}

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
export interface FlightScope {
  /**
   * In minutes, greater than 0.
   */
  blockTime: number;

  times: ReadonlyArray<Readonly<FlightTime>>;
  aircraftSelection: Readonly<AircraftSelection>;
  slot: boolean;
  slotComments: string;
  required: boolean;
}

/**
 * Data representation for an actual flight.
 */
export interface Flight {
  std: Daytime;
  aircraftRegisterId: string;
}

export interface WeekdayFlightRequirementModel {
  id: string;
  parentId: string;
  scope: Readonly<FlightScope>;
  notes: string;
  day: number;
  flight: Readonly<Flight>;
}

export interface WeekFlightRequirementModel {
  id: string;
  definition: Readonly<FlightDefinition>;
  scope: Readonly<FlightScope>;
  days: ReadonlyArray<Readonly<WeekdayFlightRequirementModel>>;
}

export class WeekdayFlightRequirement {
  readonly id: string;
  readonly parent: WeekFlightRequirement;
  readonly scope: Readonly<FlightScope>;
  readonly notes: string;
  readonly day: number;
  readonly flight: Readonly<Flight>;

  constructor(raw: WeekdayFlightRequirementModel, parent: WeekFlightRequirement) {
    this.id = raw.id;
    this.parent = parent;
    this.scope = raw.scope;
    this.notes = raw.notes;
    this.day = raw.day;
    this.flight = raw.flight;
  }
}

export class WeekFlightRequirement {
  readonly id: string;
  readonly definition: Readonly<FlightDefinition>;
  readonly scope: Readonly<FlightScope>;
  readonly days: ReadonlyArray<Readonly<WeekdayFlightRequirement>>;

  constructor(raw: WeekFlightRequirementModel) {
    this.id = raw.id;
    this.definition = raw.definition;
    this.scope = raw.scope;
    this.days = raw.days.map(d => new WeekdayFlightRequirement(d, this)).sortBy(d => d.day);
  }

  /**
   * Gets the day flight requirement of the specified day.
   * @param day The day of the period.
   */
  get(day: number): WeekdayFlightRequirement | undefined {
    return this.days.find(d => d.day === day);
  }
}
