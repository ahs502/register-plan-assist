/**
 * Specifies a certain time of a day with minutes precision.
 * It can be invalid.
 */
export default class Daytime {
  public readonly minutes: number;

  /**
   * Creates a new Daytime.
   * @param value A number specifying minutes from midnight or a string with format 'hh:mm' or a UTC Date or a Daytime object to clone.
   * @param baseDate When provided and the value parameter is a Date object, it will be calculated from that base date not its own date.
   */
  constructor(value: any, baseDate?: Date) {
    if (typeof value === 'number' && !isNaN(value) /* && value >= 0 */) {
      this.minutes = value;
    } else if (typeof value === 'string' && /^\d+:\d+$/.test(value)) {
      const stringValue: string = value,
        separatorIndex = stringValue.indexOf(':');
      this.minutes = Number(stringValue.slice(0, separatorIndex)) * 60 + Number(stringValue.slice(separatorIndex + 1));
    } else if (value && value.constructor === Date && (value as Date).isValid()) {
      if (baseDate) {
        const date = new Date(baseDate);
        date.setUTCHours(0, 0, 0, 0);
        this.minutes = Math.max(0, Math.floor(((value as Date).getTime() - date.getTime()) / (60 * 1000)));
      } else {
        this.minutes = (value as Date).getUTCMinutes() + (value as Date).getUTCHours() * 60;
      }
    } else if (value && value.constructor === Daytime) {
      this.minutes = (value as Daytime).minutes;
    } else {
      this.minutes = NaN;
    }
  }

  /**
   * Returns true iff the minutes of this Daytime is NaN.
   */
  isValid(): boolean {
    return !isNaN(this.minutes);
  }

  /**
   * Overrides the valueOf method of object and makes the instances of
   * Daytime comparable to each other by <, >= and similar operators.
   */
  valueOf(): any {
    return this.minutes;
  }

  /**
   * Returns the string with the format 'H:mm'.
   * @param clip Whether to express the daytime within 24-hours format or not.
   * For example `'2:35'` instead of `'26:35'`.
   */
  toString(clip?: boolean): string {
    this.checkValidity();
    const totalMinutes = clip ? this.minutes % (24 * 60) : this.minutes;
    const minutes = totalMinutes % 60,
      hours = (totalMinutes - minutes) / 60;
    return hours + ':' + String(minutes).padStart(2, '0');
  }

  /**
   * Returns the core data value of this object,
   * Used for serialization in JSON.stringify() method.
   */
  toJSON(): any {
    return this.minutes;
  }

  /**
   * Returns a Date object based on this Datetime.
   * @param baseDate The base date of this Daytime converison, if specified. Default date is 1970/01/01.
   */
  toDate(baseDate?: Date): Date {
    if (!this.isValid()) return new Date(NaN);
    const minutes = this.minutes % 60,
      hours = (this.minutes - minutes) / 60,
      result = baseDate ? new Date(baseDate) : new Date(0);
    result.setUTCHours(hours, minutes, 0, 0);
    return result;
  }

  /**
   * Returns +1 if this is after the other, 0 if both are equal and -1 otherwise.
   * @param other The other side of the comparison.
   */
  compare(other: Daytime): number {
    this.checkValidity();
    other.checkValidity();
    return Math.sign(this.minutes - other.minutes);
  }

  private checkValidity() {
    if (!this.isValid()) throw new Error('This daytime is invalid.');
  }

  /**
   * Returns the parsed Daytime from the given string value.
   * The Daytime will be invalid if the string format isn't valid.
   * @param value The string Daytime with this format: 'hh:mm', 'hhh:mm', 'h:m' and so on.
   */
  static parse(value: string): Daytime {
    return new Daytime(value);
  }
}
