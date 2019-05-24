import IClonable from './IClonable';

/**
 * A day mapper object for a periodic date interval.
 */
export default abstract class Period<C extends IClonable<C>> implements IClonable<Period<C>> {
  /**
   * The length of this periodic interval.
   */
  public readonly length: number;

  /**
   * The mapped content.
   */
  public readonly contents: (C | undefined)[];

  /**
   * Creates a new Period.
   * @param length The length of this periodic interval.
   * @param contents The mapped contents. Empty by default.
   */
  constructor(length: number, contents?: (C | undefined)[]) {
    this.length = length;
    this.contents = (contents || []).map(d => d && (d as C).clone());
    while (this.contents.length < length) {
      this.contents.push(undefined);
    }
  }

  abstract clone(): Period<C>;

  /**
   * Returns the list of only existing day contents.
   */
  getExistingContents(): C[] {
    return this.contents.filter(Boolean) as C[];
  }

  /**
   * Returns an array of this period length of booleans
   * indicating whether the day content exists or not.
   */
  getExistanceStatus(): boolean[] {
    return this.contents.map(Boolean);
  }
}

/**
 * The days of a week starting from Saturday.
 */
export enum Weekday {
  Saturday,
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday
}

/**
 * A day mapper object for a periodic week.
 */
export class Week<C extends IClonable<C>> extends Period<C> {
  /**
   * Creates a new Week.
   * @param contents The mapped contents. Empty by default.
   */
  constructor(contents?: (C | undefined)[]) {
    super(7, contents);
  }

  clone(): Week<C> {
    return new Week(this.contents);
  }
}
