/*eslint no-extend-native: "off", no-self-compare: "off"*/

(function() {
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  Array.range = function Array_range(start: number, end: number, step?: number): number[] {
    let actualStep = step || 1;
    actualStep = actualStep > 0 ? +actualStep : -actualStep;
    const result: number[] = [];
    if (start <= end) {
      while (start <= end) {
        result.push(start);
        start += actualStep;
      }
    } else {
      while (start >= end) {
        result.push(start);
        start -= actualStep;
      }
    }
    return result;
  };

  Array.prototype.remove = function Array_prototype_remove<T>(item: T): number {
    let result = 0;
    let index = 0;
    while (index < this.length) {
      if (this[index] === item) {
        this.splice(index, 1);
        result++;
      } else {
        ++index;
      }
    }
    return result;
  };

  Array.prototype.sortBy = function Array_prototype_sortBy<T>(propertySelector: keyof T | ((item: T) => any), descending?: boolean): T[] {
    const generalPropertySelector = typeof propertySelector === 'function' ? propertySelector : (item: T) => item[propertySelector];
    const direction = descending ? -1 : +1;
    return this.sort((a, b) => {
      const aValue = generalPropertySelector(a);
      const bValue = generalPropertySelector(b);
      return aValue > bValue ? +direction : aValue < bValue ? -direction : 0;
    });
  };

  Array.prototype.orderBy = function Array_prototype_orderBy<T>(propertySelector: keyof T | ((item: T) => any), descending?: boolean): T[] {
    return this.slice().sortBy(propertySelector, descending);
  };

  Array.prototype.distinct = function Array_prototype_distinct<T>(areEqual?: (a: T, b: T) => boolean): T[] {
    const areEqualFunction: (a: T, b: T) => boolean = areEqual || ((a: T, b: T) => a === b);
    const result: T[] = [];
    for (let i = 0; i < this.length; ++i) {
      result.find(x => areEqualFunction(this[i], x)) || result.push(this[i]);
    }
    return result;
  };

  Array.prototype.flatten = function Array_prototype_flatten(): any[] {
    const result: any[] = [];
    this.forEach(item => {
      if (!Array.isArray(item)) return result.push(item);
      item.forEach(i => result.push(i));
    });
    return result;
  };

  Array.prototype.groupBy = function Array_prototype_groupBy<T>(groupName: keyof T | ((item: T) => string)): { [groupName: string]: T[] } {
    const groups: { [groupName: string]: T[] } = {};
    this.forEach(item => {
      const name = typeof groupName === 'function' ? groupName(item) : item[groupName];
      groups[name] = groups[name] || [];
      groups[name].push(item);
    });
    return groups;
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const monthNames = <const>['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const shortMonthNames = <const>['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  Date.concatDateTime = function Date_concatDateTime(date: Date, time: Date): Date {
    if (!date.isValid()) return date;
    if (!time.isValid()) return time;
    const result = new Date(date);
    result.setUTCHours(time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds(), time.getUTCMilliseconds());
    return result;
  };

  Date.prototype.isValid = function Date_prototype_isValid(): boolean {
    // An invalid date object returns NaN for getTime() and NaN is the only object not strictly equal to itself.
    return this.getTime() === this.getTime();
  };

  Date.prototype.format = function Date_prototype_format(mode: DateFormat): string {
    switch (mode) {
      case 'D':
        throw new Error('Not implemented!');

      case 'D#':
        throw new Error('Not implemented!');

      case 'd':
        return `${String(this.getUTCDate()).padStart(2, '0')}${shortMonthNames[this.getUTCMonth()]}${String(this.getUTCFullYear()).slice(-2)}`;

      case 'd#':
        throw new Error('Not implemented!');

      case 'D$':
        throw new Error('Not implemented!');

      case '~D$':
        return `${this.getUTCDate()} ${monthNames[this.getUTCMonth()]} ${this.getUTCFullYear()}`;

      case 'T':
        throw new Error('Not implemented!');

      case 'T0':
        throw new Error('Not implemented!');

      case 'T#':
        throw new Error('Not implemented!');

      case 't':
        return `${String(this.getUTCHours()).padStart(2, '0')}:${String(this.getUTCMinutes()).padStart(2, '0')}`;

      case 't#':
        throw new Error('Not implemented!');

      case 'DT':
        throw new Error('Not implemented!');

      case 'DT0':
        throw new Error('Not implemented!');

      default:
        throw new Error('Not implemented!');
    }
  };

  Date.prototype.getDatePart = function Date_prototype_getDatePart(): Date {
    if (!this.isValid()) return this;
    const result = new Date(this);
    result.setUTCHours(0, 0, 0, 0);
    return result;
  };
  Date.prototype.getTimePart = function Date_prototype_getTimePart(): Date {
    if (!this.isValid()) return this;
    const result = new Date(0);
    result.setUTCHours(this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds(), this.getUTCMilliseconds());
    return result;
  };

  Date.prototype.clone = function Date_prototype_clone(): Date {
    return new Date(this);
  };

  Date.prototype.addYears = function Date_prototype_addYears(years: number): Date {
    this.isValid() && this.setUTCFullYear(this.getUTCFullYear() + years);
    return this;
  };
  Date.prototype.addMonths = function Date_prototype_addMonths(months: number): Date {
    this.isValid() && this.setUTCMonth(this.getUTCMonth() + months);
    return this;
  };
  Date.prototype.addDays = function Date_prototype_addDays(days: number): Date {
    this.isValid() && this.setUTCDate(this.getUTCDate() + days);
    return this;
  };
  Date.prototype.addHours = function Date_prototype_addHours(hours: number): Date {
    this.isValid() && this.setUTCHours(this.getUTCHours() + hours);
    return this;
  };
  Date.prototype.addMinutes = function Date_prototype_addMinutes(minutes: number): Date {
    this.isValid() && this.setUTCMinutes(this.getUTCMinutes() + minutes);
    return this;
  };
  Date.prototype.addSeconds = function Date_prototype_addSeconds(seconds: number): Date {
    this.isValid() && this.setUTCSeconds(this.getUTCSeconds() + seconds);
    return this;
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
})();

export {};
