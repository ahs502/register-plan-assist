import IClonable from '../utils/IClonable';

enum Weekday {
  Saturday,
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday
}

export default Weekday;

export class Week<T> implements IClonable<Week<T>> {
  private days: T[];

  constructor(days?: T[]) {
    this.days = (days || []).slice();
  }

  clone(): Week<T> {
    return new Week<T>(this.days);
  }

  toArray(): T[] {
    return this.days.slice();
  }
  // set(weekday:Weekday,value:T){
  //   this.days[]
  // }
}
