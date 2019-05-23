import IClonable from '../utils/IClonable';
import FlightDefinition from './FlightDefinition';
import FlightScope from './FlightScope';
import Period, { Weekday, Week } from './Period';
import { Daytime } from './Daytime';

export abstract class PeriodFlightRequirement<P extends Period<DayFlightRequirement<P>>> implements IClonable<PeriodFlightRequirement<P>> {
  definition: FlightDefinition;
  scope: FlightScope;

  /**
   * The day flight requirements for this object.
   * NOTE: Do not manipulate the day flight requirement directly from this.period object;
   * use get() and set() methods instead.
   */
  period: P;

  constructor(definition: FlightDefinition, scope: FlightScope, period: P) {
    this.definition = definition;
    this.scope = scope;

    this.period = period;
  }

  abstract clone(): PeriodFlightRequirement<P>;

  /**
   * Generates, sets and returns a new DayFlightRequirement from this for the specified day.
   * @param day The specified day.
   */
  abstract generateForDay(day: number): DayFlightRequirement<P>;

  /**
   * Gets the day flight requirement of the specified day.
   * @param day The day of the period.
   */
  get(day: number): DayFlightRequirement<P> | undefined {
    return this.period.contents[day];
  }

  /**
   * Sets (or clears) the day flight requirement of the specified day.
   * @param day The day of the period.
   * @param content The day flight requirement for the specified day. Empty by default.
   */
  set(day: number, content?: DayFlightRequirement<P>): void {
    if (content) {
      (content as DayFlightRequirement<P>).day = day;
    }
    this.period.contents[day] = content;
  }
}

export abstract class DayFlightRequirement<P extends Period<DayFlightRequirement<P>>> implements IClonable<DayFlightRequirement<P>> {
  parent: PeriodFlightRequirement<P>;

  scope: FlightScope;
  notes: string;
  day: number;

  std: Daytime;
  aircraftRegisterId: string;

  constructor(parent: PeriodFlightRequirement<P>, scope: FlightScope, notes: string, day: number, std?: Daytime, aircraftRegisterId?: string) {
    this.parent = parent;

    this.scope = scope;
    this.notes = notes;
    this.day = day;

    this.std = std || this.scope.times[0].stdLowerBound;
    this.aircraftRegisterId = aircraftRegisterId || (this.scope.aircraftSelection.getAircraftRegisters()[0] || {}).id;
  }

  abstract clone(): DayFlightRequirement<P>;
}

export class WeekFlightRequirement extends PeriodFlightRequirement<Week<WeekdayFlightRequirement>> {
  constructor(definition: FlightDefinition, scope: FlightScope, period?: Week<WeekdayFlightRequirement>) {
    super(definition, scope, period || new Week<WeekdayFlightRequirement>());
  }

  clone(): WeekFlightRequirement {
    return new WeekFlightRequirement(this.definition.clone(), this.scope.clone(), this.period.clone());
  }

  generateForDay(day: number): WeekdayFlightRequirement {
    let result = new WeekdayFlightRequirement(this, this.scope.clone(), '', day);
    this.set(day, result);
    return result;
  }
}

export class WeekdayFlightRequirement extends DayFlightRequirement<Week<WeekdayFlightRequirement>> {
  constructor(parent: WeekFlightRequirement, scope: FlightScope, notes: string, day: Weekday, std?: Daytime, aircraftRegisterId?: string) {
    super(parent, scope, notes, day, std, aircraftRegisterId);
  }

  clone(): WeekdayFlightRequirement {
    return new WeekdayFlightRequirement(this.parent, this.scope.clone(), this.notes, this.day, this.std, this.aircraftRegisterId);
  }
}
