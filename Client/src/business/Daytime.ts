/**
 * Specifies a certain time of a day with minutes precision.
 * It can be invalid.
 */
export class Daytime {
  public readonly minutes: number;

  /**
   * Creates a new Daytime.
   * @param value A number specifying minutes from midnight or a string with format 'hh:mm' or a UTC Date or a Daytime object to clone.
   * @param baseDate When provided and the value parameter is a Date object, it will be calculated from that base date not its own date.
   */
  constructor(value: any, baseDate?: Date) {
    if (typeof value === 'number' && !isNaN(value) && value >= 0) {
      this.minutes = value;
    } else if (typeof value === 'string' && /^\d+:\d+$/.test(value)) {
      let stringValue: string = value,
        separatorIndex = stringValue.indexOf(':');
      this.minutes = Number(stringValue.slice(0, separatorIndex)) * 60 + Number(stringValue.slice(separatorIndex + 1));
    } else if (value && value.constructor === Date && !isNaN((<Date>value).getTime())) {
      if (baseDate) {
        let date = baseDate as Date;
        date.setUTCHours(0, 0, 0, 0);
        this.minutes = Math.max(0, Math.floor(((value as Date).getTime() - (date as Date).getTime()) / (60 * 1000)));
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
   * Returns the string with this format: 'hh:mm' or 'hhh:mm'.
   */
  toString(): string {
    this.checkValidity();
    let minutes = this.minutes % 60,
      hours = (this.minutes - minutes) / 60;
    return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
  }

  /**
   * Returns a Date object based on this Datetime.
   * @param baseDate The base date of this Daytime converison, if specified. Default date is 1970/01/01.
   */
  toDate(baseDate?: Date): Date {
    if (!this.isValid()) return new Date(NaN);
    let minutes = this.minutes % 60,
      hours = (this.minutes - minutes) / 60,
      result = baseDate || new Date(0);
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
