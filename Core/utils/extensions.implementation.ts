/*eslint no-extend-native: "off", no-self-compare: "off"*/

(function() {
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Array:
  {
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

    Array.prototype.sortBy = function Array_prototype_sortBy<T>(...propertySelectors: (keyof T | ((item: T) => any))[]): T[] {
      return this.sort((a, b) => {
        for (let index = 0; index < propertySelectors.length; ++index) {
          const propertySelector = propertySelectors[index];
          const generalPropertySelector = typeof propertySelector === 'function' ? propertySelector : (item: T) => item[propertySelector];
          const aValue = generalPropertySelector(a);
          const bValue = generalPropertySelector(b);
          if (aValue > bValue) return +1;
          if (aValue < bValue) return -1;
        }
        return 0;
      });
    };

    Array.prototype.sortByDescending = function Array_prototype_sortByDescending<T>(...propertySelectors: (keyof T | ((item: T) => any))[]): T[] {
      return this.sort((a, b) => {
        for (let index = 0; index < propertySelectors.length; ++index) {
          const propertySelector = propertySelectors[index];
          const generalPropertySelector = typeof propertySelector === 'function' ? propertySelector : (item: T) => item[propertySelector];
          const aValue = generalPropertySelector(a);
          const bValue = generalPropertySelector(b);
          if (aValue > bValue) return -1;
          if (aValue < bValue) return +1;
        }
        return 0;
      });
    };

    Array.prototype.orderBy = function Array_prototype_orderBy<T>(...propertySelectors: (keyof T | ((item: T) => any))[]): T[] {
      return this.slice().sortBy(...propertySelectors);
    };

    Array.prototype.orderByDescending = function Array_prototype_orderByDescending<T>(...propertySelectors: (keyof T | ((item: T) => any))[]): T[] {
      return this.slice().sortByDescending(...propertySelectors);
    };

    function isNotDuplicatedBefore<T>(item: T, index: number, array: T[]): boolean {
      return array.indexOf(item) === index;
    }
    Array.prototype.distinct = function Array_prototype_distinct<T>(areEqual?: (a: T, b: T) => boolean): T[] {
      return this.filter(isNotDuplicatedBefore);
    };

    Array.prototype.flatten = function Array_prototype_flatten(): any[] {
      const result: any[] = [];
      this.forEach(item => {
        if (!Array.isArray(item)) return result.push(item);
        item.forEach(i => result.push(i));
      });
      return result;
    };

    Array.prototype.groupBy = function Array_prototype_groupBy<T>(groupName: keyof T | ((item: T) => string), mapper?: (group: T[]) => any): { [groupName: string]: any } {
      const result: { [groupName: string]: any } = {};
      this.forEach(item => {
        const name = typeof groupName === 'function' ? groupName(item) : item[groupName];
        result[name] = result[name] || [];
        result[name].push(item);
      });
      mapper && Object.keys(result).forEach(groupName => (result[groupName] = mapper(result[groupName])));
      return result;
    };

    Array.prototype.toDictionary = function Array_prototype_toDictionary<T>(key: keyof T | ((item: T) => string), mapper?: (item: T) => any): { [key: string]: any } {
      const result: { [key: string]: any } = {};
      this.forEach(item => {
        const name = typeof key === 'function' ? key(item) : item[key];
        result[name] = mapper ? mapper(item) : item;
      });
      return result;
    };
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Date:
  {
    const monthNames = <const>['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const shortMonthNames = <const>['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    Date.invalidDate = new Date(NaN);

    Date.parseUtc = function Date_parseUtc(date: string): Date {
      if (!date) return Date.invalidDate;
      const parts = date.match(/^(\d\d)([a-zA-Z]{3})(\d\d)$/);
      if (parts) {
        const [date, days, month, years] = parts;
        const daysNumber = Number(days);
        if (daysNumber <= 0 || daysNumber > 31) return Date.invalidDate;
        const monthIndex = shortMonthNames.indexOf((month[0].toUpperCase() + month.slice(1).toLowerCase()) as any);
        if (monthIndex < 0) return Date.invalidDate;
        let yearsNumber = Number(years);
        yearsNumber = yearsNumber < 70 ? 2000 + yearsNumber : 1900 + yearsNumber; //TODO: Fix this before year 2070.
        return new Date(Date.UTC(yearsNumber, monthIndex, daysNumber, 0, 0, 0, 0));
      }
      //TODO: Support more date string formats if needed here.
      return Date.invalidDate;
    };

    Date.toJSON = function Date_toJSON(date: Date | string | number | null | undefined): string {
      const invalidDateString = 'Invalid date.';
      if (typeof date === 'number') {
        if (isNaN(date)) return invalidDateString;
        return new Date(date).toJSON();
      }
      if (typeof date === 'string') {
        const dateObject = Date.parseUtc(date);
        if (!dateObject) return '';
        if (!dateObject.isValid()) return invalidDateString;
        return dateObject.toJSON();
      }
      if (!date) return '';
      if (date.constructor === Date) {
        if (!date.isValid()) return invalidDateString;
        return date.toJSON();
      }

      return '';
    };

    Date.concatDateTime = function Date_concatDateTime(date: Date, time: Date): Date {
      if (!date.isValid()) return date;
      if (!time.isValid()) return time;
      const result = new Date(date);
      result.setUTCHours(time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds(), time.getUTCMilliseconds());
      return result;
    };

    Date.intervalCovers = function Date_intervalCovers<T extends Date | number | string>(firstStart: T, firstEnd: T, secondStart: T, secondEnd: T): boolean {
      return firstStart <= secondStart && firstEnd >= secondEnd;
    };

    Date.intervalOverlaps = function Date_intervalOverlaps<T extends Date | number | string>(firstStart: T, firstEnd: T, secondStart: T, secondEnd: T): boolean {
      return firstStart <= secondEnd && firstEnd >= secondStart;
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

    Date.prototype.equals = function Date_prototype_equals(date: Date | string | number): boolean {
      if (!this.isValid()) return false;
      const that = new Date(date);
      if (!that.isValid()) return false;
      return this.getTime() === that.getTime();
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
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
})();

export {};
