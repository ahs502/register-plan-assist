export default class Week {
  readonly startDate: Date;
  readonly endDate: Date;

  constructor(source: Date | Week) {
    const datePart = source instanceof Date ? source.getDatePart() : source.startDate;
    const weekday = datePart.getWeekday();
    this.startDate = datePart.clone().addDays(-weekday);
    this.endDate = datePart.clone().addDays(6 - weekday);
  }

  equals(other: Week): boolean {
    return this.startDate.equals(other.startDate);
  }
}

export class Weeks {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly weeks: readonly Week[];

  constructor(startDate: Date, endDate: Date) {
    this.startDate = new Week(startDate).startDate;
    this.endDate = new Week(endDate).endDate;

    const weeks: Week[] = [];
    const date = this.startDate.clone();
    do {
      weeks.push(new Week(date));
      date.addDays(7);
    } while (weeks.last()!.endDate < this.endDate);
    this.weeks = weeks;
  }
}
