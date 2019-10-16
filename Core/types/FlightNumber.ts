export default class FlightNumber {
  readonly isValid: boolean;

  /**
   * The 2 or 3 character airline code,
   * e.g.: **`'W5'`** for `'W5 1122'` or **`'ABC'`** for `'ABC0001X'`.
   * The default value is **`'W5'`** if it is not specified.
   */
  readonly airlineCode: string;

  /**
   * The 4 character numeric part,
   * e.g.: **`'0062'`** for `'W5 0062S'`.
   */
  readonly number: string;

  /**
   * The 1 character postfix (if specified),
   * e.g.: **`'A'`** for `'W5 1234A'` or **`''`** for `'6K 3322'`.
   */
  readonly postfix: string;

  /**
   * The full standard format of the flight number,
   * e.g.: **`'W5 0052A'`** or **`'6K 1234'`**
   */
  readonly standardFormat: string;

  private static readonly regex = /^([A-Z]{1}\d{1}\s|\d{1}[A-Z]{1}\s|[A-Z]{2}\s|[A-Z]{3}|)(\d{1,4})([A-Z]?)$/;
  private static readonly defaultAirlineCode = 'W5';

  /**
   * Parses the given string and initiates a FlightNumber object.
   * It accepts all valid flight number formats and provide their standard formats.
   * For example: `'W5 1234B'`, `'6K 051'`, `'AAA0A'`, `'4502C'`, `'51'`, `'060X'`, `'W5 1'`.
   */
  constructor(readonly source: string) {
    const parts = source
      .trim()
      .toUpperCase()
      .match(FlightNumber.regex);

    if ((this.isValid = !!parts)) {
      this.airlineCode = parts[1].trimRight() || FlightNumber.defaultAirlineCode;
      this.number = parts[2].padStart(4, '0');
      this.postfix = parts[3];
      this.standardFormat = `${this.airlineCode.padEnd(3, ' ')}${this.number}${this.postfix}`;
      return;
    }

    this.airlineCode = this.number = this.postfix = this.standardFormat = '';
  }

  /**
   * The same as `number` property but only 3 digits for numbers less than 1000,
   * e.g.: **`'061'`** for `'W5 0061'` or **`'4580'`** for `'W5 4580'`.
   */
  get shortNumber(): string {
    return this.number[0] === '0' ? this.number.slice(1) : this.number;
  }

  toString(): string {
    return this.isValid ? this.standardFormat : 'Invalid Flight Number';
  }
}
