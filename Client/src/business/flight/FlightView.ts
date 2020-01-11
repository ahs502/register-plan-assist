import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import { Stc } from 'src/business/master-data';
import Rsx from '@core/types/Rsx';
import Weekday from '@core/types/Weekday';
import Id from '@core/types/Id';
import FlightLegView from 'src/business/flight/FlightLegView';
import Week from 'src/business/Week';
import Flight from 'src/business/flight/Flight';
import { ShortMonthNames } from '@core/types/MonthName';
import { dataTypes } from 'src/utils/DataType';

export default class FlightView {
  // Original:
  readonly aircraftRegister?: PreplanAircraftRegister;
  readonly legs: readonly FlightLegView[];

  // References:
  readonly aircraftRegisters: PreplanAircraftRegisters;
  readonly flightRequirement: FlightRequirement;
  readonly dayFlightRequirement: DayFlightRequirement;
  readonly sourceFlight: Flight;
  readonly flights: readonly Flight[];

  // Duplicates:
  readonly label: string;
  readonly category: string;
  readonly stc: Stc;
  readonly rsx: Rsx;
  readonly day: Weekday;
  readonly notes: string;
  readonly originPermission: boolean | undefined;
  readonly destinationPermission: boolean | undefined;

  // Computational:
  readonly derivedId: Id;
  readonly start: Daytime;
  readonly end: Daytime;
  readonly weekStart: number;
  readonly weekEnd: number;
  readonly sections: readonly {
    readonly start: number;
    readonly end: number;
  }[];
  readonly startDateTime: Date;
  readonly endDateTime: Date;
  readonly icons: readonly string[]; //TODO: Check if it is really required.

  constructor(flights: readonly Flight[], startWeek: Week, endWeek: Week, week: Week, preplanStartDate: Date, preplanEndDate: Date) {
    const { sourceFlight, notes } = flights.map(sourceFlight => ({ sourceFlight, notes: createNotes(sourceFlight) })).sortBy(({ notes }) => notes.length)[0];

    this.sourceFlight = sourceFlight;

    this.aircraftRegister = this.sourceFlight.aircraftRegister;

    this.aircraftRegisters = this.sourceFlight.aircraftRegisters;
    this.flightRequirement = this.sourceFlight.flightRequirement;
    this.dayFlightRequirement = this.sourceFlight.dayFlightRequirement;
    this.flights = flights;

    this.legs = this.sourceFlight.legs.map(l => new FlightLegView(l, this, startWeek, endWeek, week));

    this.label = this.sourceFlight.label;
    this.category = this.sourceFlight.category;
    this.stc = this.sourceFlight.stc;
    this.rsx = this.sourceFlight.rsx;
    this.day = this.sourceFlight.day;
    this.notes = notes;
    this.originPermission = this.sourceFlight.originPermission;
    this.destinationPermission = this.sourceFlight.destinationPermission;

    this.derivedId = String((FlightView.idCounter = FlightView.idCounter === Number.MAX_SAFE_INTEGER ? 1 : FlightView.idCounter + 1));
    this.start = this.sourceFlight.start;
    this.end = this.sourceFlight.end;
    this.weekStart = this.sourceFlight.weekStart;
    this.weekEnd = this.sourceFlight.weekEnd;
    this.sections = this.sourceFlight.sections;

    // Fields which should be calculated for view:
    this.startDateTime = new Date(week.startDate.getTime() + this.weekStart * 60 * 1000);
    this.endDateTime = new Date(week.startDate.getTime() + this.weekEnd * 60 * 1000);
    this.icons = [];

    function createNotes(sourceFlight: Flight): string {
      const diffInTime = endWeek.startDate.getTime() - startWeek.startDate.getTime();
      const diffInDays = diffInTime / (24 * 60 * 60 * 1000);
      const diffInWeek = diffInDays / 7 + 1;

      const flightDay = sourceFlight.day;
      const startDate = new Date(startWeek.startDate).addDays(flightDay);
      const allDays = Array.range(0, diffInWeek - 1).map(d => {
        return new Date(startDate).addDays(d * 7);
      });

      if (allDays[0] < preplanStartDate) allDays.shift();
      if (allDays[allDays.length - 1] > preplanEndDate) allDays.pop();

      const sortedFlights = flights.orderBy('date');
      const canclationOrActiveationPerDay: string | undefined = generateCanalationOrActivationNotes();
      const stdChange: string | undefined = generateStdChangeNotes();
      const blockTimeChange: string | undefined = generateBlockTimeChangeNotes();
      const registerChange: string | undefined = generateRegisterChangeNotes();
      const permissionAndPermissionNotesChange: string | undefined = generatePermissionAndPermissionNotesChangeNotes();
      const notesChange: string | undefined = generateNotesChangeNotes(); //TODO implement
      const rsxChange: string | undefined = generateRsxChangeNotes();

      return [canclationOrActiveationPerDay, stdChange, blockTimeChange, registerChange, permissionAndPermissionNotesChange, notesChange, rsxChange].filter(Boolean).join(',');

      function generateCanalationOrActivationNotes(): string | undefined {
        const firstFlight = sortedFlights[0];
        if (diffInWeek === sortedFlights.length) {
          return undefined;
        } else {
          if (firstFlight.date.getDatePart().getTime() === allDays[0].getTime()) {
            const groupCancleDay = allDays.reduce<Date[][]>((acc, cur) => {
              const lastElement: Date[] = acc[acc.length - 1] || (acc.push([] as Date[]) && acc[acc.length - 1]);
              if (flights.some(f => f.date.getDatePart().getTime() == cur.getTime())) {
                lastElement.length > 0 && acc.push([]);
              } else {
                lastElement.push(cur);
              }
              return acc;
            }, []);

            return groupCancleDay
              .map(n =>
                n.length >= 2
                  ? `CNL ${n[0].getUTCDate()}${ShortMonthNames[n[0].getMonth()]} TILL ${n[n.length - 1].getUTCDate()}${ShortMonthNames[n[n.length - 1].getMonth()]}`
                  : n.length === 1
                  ? `CNL ${n[0].getUTCDate()}${ShortMonthNames[n[0].getMonth()]}`
                  : undefined
              )
              .filter(Boolean)
              .join(',');
          } else {
            const groupActiveDay = allDays.reduce<Date[][]>((acc, cur) => {
              const lastElement: Date[] = acc[acc.length - 1] || (acc.push([] as Date[]) && acc[acc.length - 1]);
              if (!flights.some(f => f.date.getDatePart().getTime() == cur.getTime())) {
                lastElement.length > 0 && acc.push([]);
              } else {
                lastElement.push(cur);
              }
              return acc;
            }, []);

            return groupActiveDay
              .map(n =>
                n.length >= 2
                  ? `FM ${n[0].getUTCDate()}${ShortMonthNames[n[0].getMonth()]} TILL ${n[n.length - 1].getUTCDate()}${ShortMonthNames[n[n.length - 1].getMonth()]}`
                  : n.length === 1
                  ? `FM ${n[0].getUTCDate()}${ShortMonthNames[n[0].getMonth()]}`
                  : undefined
              )
              .filter(Boolean)
              .join(',');
          }
        }
      }

      function generateStdChangeNotes(): string | undefined {
        return generateChangeNotes(
          (firstFlight, secondFlight) => firstFlight.legs.every((l, index) => l.std.compare(secondFlight.legs[index].std) === 0),
          'Time Change',
          changes =>
            changes
              .map(n =>
                n.dates.length >= 2
                  ? `TIM ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]} TILL ${n.dates[n.dates.length - 1].getUTCDate()}${
                      ShortMonthNames[n.dates[n.dates.length - 1].getMonth()]
                    }`
                  : n.dates.length === 1
                  ? `TIM ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]}`
                  : undefined
              )
              .filter(Boolean)
              .join(',')
        );
      }

      function generateBlockTimeChangeNotes(): string | undefined {
        return generateChangeNotes(
          (firstFlight, secondFlight) => firstFlight.legs.every((l, index) => l.blockTime.compare(secondFlight.legs[index].blockTime) === 0),
          'BlockTime Change',
          changes =>
            changes
              .map(n =>
                n.dates.length >= 2
                  ? `BLK ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]} TILL ${n.dates[n.dates.length - 1].getUTCDate()}${
                      ShortMonthNames[n.dates[n.dates.length - 1].getMonth()]
                    }`
                  : n.dates.length === 1
                  ? `BLK ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]}`
                  : undefined
              )
              .filter(Boolean)
              .join(',')
        );
      }

      function generateRegisterChangeNotes(): string | undefined {
        return generateChangeNotes(
          (firstFlight, secondFlight) => firstFlight.aircraftRegister === secondFlight.aircraftRegister,
          flight => flight.aircraftRegister?.['name'] ?? '',
          changes =>
            changes
              .map(n =>
                n.dates.length >= 2
                  ? `REG ${n.change} ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]} TILL ${n.dates[n.dates.length - 1].getUTCDate()}${
                      ShortMonthNames[n.dates[n.dates.length - 1].getMonth()]
                    }`
                  : n.dates.length === 1
                  ? `REG ${n.change} ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]}`
                  : undefined
              )
              .filter(Boolean)
              .join(',')
        );
      }

      function generatePermissionAndPermissionNotesChangeNotes(): string | undefined {
        return generateChangeNotes(
          (firstFlight, secondFlight) => firstFlight.destinationPermission === secondFlight.destinationPermission && firstFlight.originPermission === secondFlight.originPermission,
          'PermissionChagne',
          changes =>
            changes
              .map(n =>
                n.dates.length >= 2
                  ? `PER ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]} TILL ${n.dates[n.dates.length - 1].getUTCDate()}${
                      ShortMonthNames[n.dates[n.dates.length - 1].getMonth()]
                    }`
                  : n.dates.length === 1
                  ? `PER ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]}`
                  : undefined
              )
              .filter(Boolean)
              .join(',')
        );
      }

      function generateNotesChangeNotes(): string | undefined {
        return generateChangeNotes(
          (firstFlight, secondFlight) => firstFlight.notes === secondFlight.notes,
          'Note change',
          changes =>
            changes
              .map(n =>
                n.dates.length >= 2
                  ? `NTE ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]} TILL ${n.dates[n.dates.length - 1].getUTCDate()}${
                      ShortMonthNames[n.dates[n.dates.length - 1].getMonth()]
                    }`
                  : n.dates.length === 1
                  ? `NTE ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]}`
                  : undefined
              )
              .filter(Boolean)
              .join(',')
        );
      }

      function generateRsxChangeNotes(): string | undefined {
        return generateChangeNotes(
          (firstFlight, secondFlight) => firstFlight.rsx === secondFlight.rsx,
          flight => flight.rsx,
          changes =>
            changes
              .map(n =>
                n.dates.length >= 2
                  ? `RSX ${n.change} ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]} TILL ${n.dates[n.dates.length - 1].getUTCDate()}${
                      ShortMonthNames[n.dates[n.dates.length - 1].getMonth()]
                    }`
                  : n.dates.length === 1
                  ? `RSX ${n.change} ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]}`
                  : undefined
              )
              .filter(Boolean)
              .join(',')
        );
      }

      function generateChangeNotes(
        comparare: (firstFlight: Flight, secondFlight: Flight) => Boolean,
        change: ((flight: Flight) => string) | string,
        generateChangeNote: (
          changes: {
            change?: string | undefined;
            dates: Date[];
          }[]
        ) => string | undefined
      ): string | undefined {
        if (sortedFlights.every(f => comparare(sourceFlight, f))) return undefined;

        const groupChangeDay = allDays.reduce<{ change?: string; dates: Date[] }[]>((acc, cur) => {
          const lastElement: { change?: string; dates: Date[] } = acc[acc.length - 1] || (acc.push({ dates: [] as Date[] }) && acc[acc.length - 1]);
          const flight = flights.find(f => f.date.getDatePart().getTime() == cur.getTime());
          if (!flight || comparare(sourceFlight, flight)) {
            lastElement.dates.length > 0 && acc.push({ dates: [] as Date[] });
          } else {
            const _change = typeof change === 'function' ? change(flight) : change;
            if (lastElement.change === _change) {
              lastElement.dates.push(cur);
            } else {
              acc.push({ change: _change, dates: [cur] });
            }
          }
          return acc;
        }, []);

        return generateChangeNote(groupChangeDay);
      }
    }
  }

  private static idCounter: number = 0;
}
