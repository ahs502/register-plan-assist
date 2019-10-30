import Daytime from '@core/types/Daytime';
import MasterData from '@core/master-data';

export function parseDateUtc(value?: string): Date | null {
  if (!value) return null;
  const parts = value.match(/^(\d\d)([a-zA-Z]{3})(\d\d)$/);
  if (parts) {
    const [date, days, month, years] = parts;
    const daysNumber = Number(days);
    if (daysNumber <= 0 || daysNumber > 31) return Date.invalidDate;
    const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf((month[0].toUpperCase() + month.slice(1).toLowerCase()) as any);
    if (monthIndex < 0) return Date.invalidDate;
    let yearsNumber = Number(years);
    yearsNumber = yearsNumber < 70 ? 2000 + yearsNumber : 1900 + yearsNumber; //TODO: Fix this before year 2070.
    return new Date(Date.UTC(yearsNumber, monthIndex, daysNumber, 0, 0, 0, 0));
  }
  //TODO: Support more date string formats if needed here.
  return Date.invalidDate;
}

export function parseDaytime(value?: string): number {
  return new Daytime(value).minutes;
}
export function parseAirport(value?: string): string | undefined {
  const airport = value && (MasterData.all.airports.items.find(f => f.name.toLowerCase() === value.toLowerCase()) || 'invalid');
  return airport && (airport === 'invalid' ? 'invalid' : airport.id);
}

export function parseTime(value: string): number | undefined {
  if (!value) return undefined;
  const daytime = new Daytime(value);
  if (daytime.isValid()) return daytime.minutes;
  return NaN;
}

export function parseMinute(value?: number): string {
  if (value === undefined) return undefined as any;

  return (
    Math.floor(value / 60)
      .toString()
      .padStart(2, '0') + (value % 60).toString().padStart(2, '0')
  );
}
