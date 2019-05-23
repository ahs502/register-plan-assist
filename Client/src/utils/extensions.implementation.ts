(function() {
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  Array.range = function Array_range(start: number, end: number, step?: number): number[] {
    let actualStep = step || 1;
    actualStep = actualStep > 0 ? +actualStep : -actualStep;
    let result: number[] = [];
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

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  Date.concatDateTime = function Date_concatDateTime(date: Date, time: Date): Date {
    if (!date.isValid()) return date;
    if (!time.isValid()) return time;
    let result = new Date(date.getTime());
    result.setUTCHours(time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds(), time.getUTCMilliseconds());
    return result;
  };

  Date.prototype.isValid = function Date_prototype_isValid(): boolean {
    // An invalid date object returns NaN for getTime() and NaN is the only object not strictly equal to itself.
    return this.getTime() === this.getTime();
  };

  Date.prototype.format = function Date_prototype_format(mode: DateFormat): string {
    switch (mode) {
      case '~D$':
        return `${this.getUTCDate()} ${monthNames[this.getUTCMonth()]} ${this.getUTCFullYear()}`;

      default:
        throw new Error('Not implemented!');
    }
  };

  Date.prototype.getDatePart = function Date_prototype_getDatePart(): Date {
    if (!this.isValid()) return this;
    let result = new Date(this.getTime());
    result.setUTCHours(0, 0, 0, 0);
    return result;
  };
  Date.prototype.getTimePart = function Date_prototype_getTimePart(): Date {
    if (!this.isValid()) return this;
    let result = new Date(0);
    result.setUTCHours(this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds(), this.getUTCMilliseconds());
    return result;
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
