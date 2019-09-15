declare interface ArrayConstructor {
  /**
   * Returns a generated range of numbers.
   * @param start Starting number of the range.
   * @param end Finishing limit of the range numbers.
   * @param step Step to increase/decrease each number in the range compared to the previous one.
   */
  range(start: number, end: number, step?: number): number[];
}

declare interface Array<T> {
  /**
   * Removes all occurance of the specified item and returns the number of removed items.
   * @param item The item to be removed.
   */
  remove(item: T): number;

  /**
   * Sorts this array by ascending order and returns the array itself as a result (mutable).
   * @param propertySelectors The list of names of the properties or mapper functions to sort on, prioritized by order.
   */
  sortBy(...propertySelectors: (keyof T | ((item: T) => any))[]): T[];

  /**
   * Sorts this array by descending order and returns the array itself as a result (mutable).
   * @param propertySelectors The list of names of the properties or mapper functions to sort on, prioritized by order.
   */
  sortByDescending(...propertySelectors: (keyof T | ((item: T) => any))[]): T[];

  /**
   * Returns a sorted copy of this array by ascending order (immutable).
   * @param propertySelectors The list of names of the properties or mapper functions to sort on, prioritized by order.
   */
  orderBy(...propertySelectors: (keyof T | ((item: T) => any))[]): T[];

  /**
   * Returns a sorted copy of this array by descending order (immutable).
   * @param propertySelectors The list of names of the properties or mapper functions to sort on, prioritized by order.
   */
  orderByDescending(...propertySelectors: (keyof T | ((item: T) => any))[]): T[];

  /**
   * Returns the distinct items of this array.
   * @param areEqual checker of object equality, by default uses ===.
   */
  distinct(areEqual?: (a: T, b: T) => boolean): T[];

  /**
   * Returns the flattened array of this array.
   */
  flatten<U>(): T extends (infer U)[] ? U[] : T[];

  /**
   * Returns a grouped dictionary of this array.
   * @param groupName The property of the items or a group name generator to group items with.
   */
  groupBy(groupName: keyof T | ((item: T) => string)): { [groupName: string]: T[] };

  /**
   * Returns a mapped grouped dictionary of this array.
   * @param groupName The property of the items or a group name generator to group items with.
   * @param mapper The mapper function for groups.
   */
  groupBy<I>(groupName: keyof T | ((item: T) => string), mapper: (group: T[]) => I): { [groupName: string]: I };

  /**
   * Returns a dictionary of this array.
   * @param key The property of the items or a key extractor to point to the items with.
   */
  toDictionary(key: keyof T | ((item: T) => string)): { [key: string]: T };

  /**
   * Returns a mapped dictionary of this array.
   * @param key The property of the items or a key extractor to point to the items with.
   * @param mapper Optional, the mapper function for items.
   */
  toDictionary<I = T>(key: keyof T | ((item: T) => string), mapper: (item: T) => I): { [key: string]: I };
}

declare interface ReadonlyArray<T> {
  /**
   * Returns a sorted copy of this array by ascending order (immutable).
   * @param propertySelectors The list of names of the properties or mapper functions to sort on, prioritized by order.
   */
  orderBy(...propertySelectors: (keyof T | ((item: T) => any))[]): T[];

  /**
   * Returns a sorted copy of this array by descending order (immutable).
   * @param propertySelectors The list of names of the properties or mapper functions to sort on, prioritized by order.
   */
  orderByDescending(...propertySelectors: (keyof T | ((item: T) => any))[]): T[];

  /**
   * Returns the distinct items of this array.
   * @param areEqual checker of object equality, by default uses ===.
   */
  distinct(areEqual?: (a: T, b: T) => boolean): T[];

  /**
   * Returns the flattened array of this array.
   */
  flatten<U>(): T extends (infer U)[] ? U[] : T[];

  /**
   * Returns a grouped dictionary of this array.
   * @param groupName The property of the items or a group name generator to group items with.
   */
  groupBy(groupName: keyof T | ((item: T) => string)): { [groupName: string]: T[] };

  /**
   * Returns a mapped grouped dictionary of this array.
   * @param groupName The property of the items or a group name generator to group items with.
   * @param mapper The mapper function for groups.
   */
  groupBy<I>(groupName: keyof T | ((item: T) => string), mapper: (group: T[]) => I): { [groupName: string]: I };

  /**
   * Returns a dictionary of this array.
   * @param key The property of the items or a key extractor to point to the items with.
   */
  toDictionary(key: keyof T | ((item: T) => string)): { [key: string]: T };

  /**
   * Returns a mapped dictionary of this array.
   * @param key The property of the items or a key extractor to point to the items with.
   * @param mapper Optional, the mapper function for items.
   */
  toDictionary<I = T>(key: keyof T | ((item: T) => string), mapper: (item: T) => I): { [key: string]: I };
}

declare type DateFormat = 'D' | 'D#' | 'd' | 'd#' | 'D$' | '~D$' | 'T' | 'T0' | 't' | 'T#' | 't#' | 'DT' | 'DT0';

declare interface DateConstructor {
  /**
   * An ivalid date instance.
   */
  invalidDate: Date;

  /**
   * Returns the parsed date object from the given date string as an UTC date.
   * Returns `null` for empty input.
   * @param date The string formatted date.
   */
  parseUtc(date?: string): Date | null;

  /**
   * Returns the JSON formatted date string or
   * empty string for empty inputs or
   * `'Invalid date'` for invalid inputs.
   * @param date The date by any supported format.
   */
  toJSON(date: Date | string | number | null | undefined): string;

  /**
   * Returns a Date object which inherits its date part
   * and its time part from two different arguments.
   * @param date The date part of the concatenation.
   * @param time The time part of the concatenation.
   */
  concatDateTime(date: Date, time: Date): Date;
}

declare interface Date {
  /**
   * Returns true iff this Date is valid.
   */
  isValid(): boolean;

  /**
   * Returns a formatted string out of this Date object.
   *
   * - **D**: *1970-01-02*
   * - **D#**: *19700102*
   * - **d**: *02Jan70*
   * - **d#**: *020170*
   * - **D$**: *1970 January 2*
   * - **~D$**: *2 January 1970*
   * - **T**: *12:34:56*
   * - **T0**: *12:34:00*
   * - **T#**: *123456*
   * - **t**: *12:34*
   * - **t#**: *1234*
   * - **DT**: *1970-01-02T12:34:56*
   * - **DT0**: *1970-01-02T12:34:00*
   *
   * @see DateFormat for more details.
   * @param mode The desired format specifier.
   */
  format(mode: DateFormat): string;

  /**
   * Returns the date part of this and makes sure its hours, minutes,
   * seconds and milliseconds are zero.
   */
  getDatePart(): Date;

  /**
   * Returns the time part of this and makes sure its date is 1970/01/01.
   */
  getTimePart(): Date;

  /**
   * Returns a clone of this.
   */
  clone(): Date;

  /**
   * Adds (or subtracts) specific amount of years to this Date and returns this.
   * @param years The number of years to add.
   */
  addYears(years: number): Date;

  /**
   * Adds (or subtracts) specific amount of months to this Date and returns this.
   * @param months The number of months to add.
   */
  addMonths(months: number): Date;

  /**
   * Adds (or subtracts) specific amount of days to this Date and returns this.
   * @param days The number of days to add.
   */
  addDays(days: number): Date;

  /**
   * Adds (or subtracts) specific amount of hours to this Date and returns this.
   * @param hours The number of hours to add.
   */
  addHours(hours: number): Date;

  /**
   * Adds (or subtracts) specific amount of minutes to this Date and returns this.
   * @param minutes The number of minutes to add.
   */
  addMinutes(minutes: number): Date;

  /**
   * Adds (or subtracts) specific amount of seconds to this Date and returns this.
   * @param seconds The number of seconds to add.
   */
  addSeconds(seconds: number): Date;
}

declare interface DateConstructor {}
