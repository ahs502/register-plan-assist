import Daytime from '@core/types/Daytime';
import AircraftSelection from '@core/types/AircraftSelection';
import FlightRequirementModel, { FlightModel, WeekdayFlightRequirementModel } from '@core/models/FlightRequirementModel';
import MasterData, { Stc, Airport } from '@core/master-data';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from './PreplanAircraftRegister';

export interface FlightDefinition {
  readonly label: string;
  readonly stc: Stc;
  readonly flightNumber: string;
  readonly departureAirport: Airport;
  readonly arrivalAirport: Airport;
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
  readonly requirement: FlightRequirement;
  readonly weekdayRequirement: WeekdayFlightRequirement;
  readonly derivedId: string;
  readonly label: string;
  readonly stc: Stc;
  readonly flightNumber: string;
  readonly departureAirport: Airport;
  readonly arrivalAirport: Airport;
  readonly day: number;
  readonly notes: string;
  readonly std: Daytime;
  readonly aircraftRegister?: PreplanAircraftRegister;

  constructor(raw: FlightModel, weekdayRequiremnet: WeekdayFlightRequirement, aircraftRegisters: PreplanAircraftRegisters) {
    this.requirement = weekdayRequiremnet.requirement;
    this.weekdayRequirement = weekdayRequiremnet;
    this.derivedId = weekdayRequiremnet.derivedId;
    this.label = weekdayRequiremnet.definition.label;
    this.stc = weekdayRequiremnet.definition.stc;
    this.flightNumber = weekdayRequiremnet.definition.flightNumber;
    this.departureAirport = weekdayRequiremnet.definition.departureAirport;
    this.arrivalAirport = weekdayRequiremnet.definition.arrivalAirport;
    this.day = weekdayRequiremnet.day;
    this.notes = weekdayRequiremnet.notes;
    this.std = new Daytime(raw.std);
    this.aircraftRegister = raw.aircraftRegisterId ? aircraftRegisters.id[raw.aircraftRegisterId] : undefined;
  }
}

export class WeekdayFlightRequirement {
  readonly requirement: FlightRequirement;
  readonly derivedId: string;
  readonly scope: FlightScope;
  readonly notes: string;
  readonly day: number;
  readonly flight: Flight;

  constructor(raw: WeekdayFlightRequirementModel, requirement: FlightRequirement, aircraftRegisters: PreplanAircraftRegisters) {
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
    this.flight = new Flight(raw.flight, this, aircraftRegisters);
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

  constructor(raw: FlightRequirementModel, aircraftRegisters: PreplanAircraftRegisters) {
    this.id = raw.id;
    this.definition = {
      label: raw.definition.label,
      stc: MasterData.all.stcs.id[raw.definition.stcId],
      flightNumber: raw.definition.flightNumber,
      departureAirport: MasterData.all.airports.id[raw.definition.departureAirportId],
      arrivalAirport: MasterData.all.airports.id[raw.definition.arrivalAirportId]
    };
    this.scope = {
      ...raw.scope,
      times: raw.scope.times.map(t => ({
        stdLowerBound: new Daytime(t.stdLowerBound),
        stdUpperBound: new Daytime(t.stdUpperBound)
      }))
    };
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
