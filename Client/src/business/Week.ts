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

  static getWeekStartDate(date: Date): Date {
    const datePart = date.getDatePart();
    const weekday = datePart.getWeekday();
    return datePart.addDays(-weekday);
  }

  static getWeekEndDate(date: Date): Date {
    const datePart = date.getDatePart();
    const weekday = datePart.getWeekday();
    return datePart.addDays(6 - weekday);
  }
}

export class Weeks {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly weeks: readonly Week[];
  readonly chunks: readonly Week[][];

  constructor(startDate: Date, endDate: Date, checkChunkStart: (previousWeek: Week, nextWeek: Week) => boolean) {
    this.startDate = new Week(startDate).startDate;
    this.endDate = new Week(endDate).endDate;

    const weeks: Week[] = (this.weeks = []);
    const date = this.startDate.clone();
    do {
      weeks.push(new Week(date));
      date.addDays(7);
    } while (weeks.last()!.endDate < this.endDate);

    const chunks: Week[][] = (this.chunks = []);
    let newChunk = true;
    this.weeks.forEach((week, index, weeks) => {
      newChunk ? chunks.push([week]) : chunks.last()!.push(week);
      newChunk = index !== weeks.length - 1 && checkChunkStart(week, weeks[index + 1]);
    });
  }
}
