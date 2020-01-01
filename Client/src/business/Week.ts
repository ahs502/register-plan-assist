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
  readonly all: readonly Week[];
  readonly chunks: readonly WeekChunk[];
  readonly range: WeekRange;

  constructor(startDate: Date, endDate: Date, checkChunkStart: (previousWeek: Week, nextWeek: Week) => boolean) {
    this.startDate = new Week(startDate).startDate;
    this.endDate = new Week(endDate).endDate;

    const weeks: Week[] = (this.all = []);
    const date = this.startDate.clone();
    do {
      weeks.push(new Week(date));
      date.addDays(7);
    } while (weeks.last()!.endDate < this.endDate);

    const chunks: Week[][] = [];
    let newChunk = true;
    this.all.forEach((week, index, weeks) => {
      newChunk ? chunks.push([week]) : chunks.last()!.push(week);
      newChunk = index !== weeks.length - 1 && checkChunkStart(week, weeks[index + 1]);
      //newChunk = index % 3 === 2; //TODO: Remove this line.
    });
    this.chunks = chunks.map(chunk => new WeekChunk(this, chunk));

    this.range = new WeekRange(this);
  }
}

export class WeekChunk {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly range: WeekRange;

  constructor(readonly weeks: Weeks, readonly all: readonly Week[]) {
    const startWeek = all[0];
    const endWeek = all.last()!;
    this.startDate = startWeek.startDate;
    this.endDate = endWeek.endDate;
    this.startIndex = weeks.all.indexOf(startWeek);
    this.endIndex = weeks.all.indexOf(endWeek) + 1;
    this.range = new WeekRange(weeks, all);
  }
}

export class WeekRange {
  readonly start: Week;
  readonly end: Week;
  readonly all: readonly Week[];

  constructor(weeks: Weeks, chunk?: readonly Week[]);
  constructor(weeks: Weeks, start: Week, end?: Week);
  constructor(weeks: Weeks, a?: readonly Week[] | Week, b?: Week) {
    if (!a && !b) {
      this.start = weeks.all[0];
      this.end = weeks.all.last()!;
      this.all = weeks.all;
    } else if (Array.isArray(a) && a.length > 0 && !b) {
      this.start = a[0];
      this.end = a.last()!;
      this.all = a;
    } else if (a instanceof Week && b instanceof Week) {
      const { startIndex, endIndex } =
        a.startDate < b.startDate ? { startIndex: weeks.all.indexOf(a), endIndex: weeks.all.indexOf(b) } : { startIndex: weeks.all.indexOf(b), endIndex: weeks.all.indexOf(a) };
      this.start = weeks.all[startIndex];
      this.end = weeks.all[endIndex];
      this.all = weeks.all.slice(startIndex, endIndex + 1);
    } else throw 'Invalid arguments.';
  }
}
