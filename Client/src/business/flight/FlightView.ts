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

  constructor(flights: readonly Flight[], startWeek: Week, endWeek: Week, week: Week) {
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
      const sortedFlights = flights.orderBy('date');
      const canclationOrActiveationPerDay: string | undefined = generateCanalationOrActivationNotes();
      const timeChange: string | undefined = generateTimeChangeNotes();
      const registerChange: string | undefined = generateRegisterChangeNotes();
      const permissionAndPermissionNotesChange: string | undefined = generatePermissionAndPermissionNotesChangeNotes();
      const notesChange: string | undefined = generateNotesChangeNotes(); //TODO implement
      const rsxChange: string | undefined = generateRsxChangeNotes();

      return [canclationOrActiveationPerDay, timeChange, registerChange, permissionAndPermissionNotesChange, notesChange, rsxChange].filter(Boolean).join(',');

      function generateCanalationOrActivationNotes(): string | undefined {
        const diffInTime = endWeek.startDate.getTime() - startWeek.startDate.getTime();
        const diffInDays = diffInTime / (24 * 60 * 60 * 1000);
        const diffInWeek = diffInDays / 7 + 1;

        const firstFlight = sortedFlights[0];
        const startDate = firstFlight.date;
        const allDays = Array.range(0, diffInWeek - 1).map(d => {
          return new Date(startDate).addDays(d * 7);
        });
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
                  ? `CNL ${n[0].getUTCDate()}/${ShortMonthNames[n[0].getMonth()]} TILL ${n[n.length - 1].getUTCDate()}/${ShortMonthNames[n[n.length - 1].getMonth()]}`
                  : n.length === 1
                  ? `CNL ${n[0].getUTCDate()}/${ShortMonthNames[n[0].getMonth()]}`
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
                  ? `FM ${n[0].getUTCDate()}/${ShortMonthNames[n[0].getMonth()]} TILL ${n[n.length - 1].getUTCDate()}/${ShortMonthNames[n[n.length - 1].getMonth()]}`
                  : n.length === 1
                  ? `FM ${n[0].getUTCDate()}/${ShortMonthNames[n[0].getMonth()]}`
                  : undefined
              )
              .filter(Boolean)
              .join(',');
          }
        }
      }

      function generateTimeChangeNotes(): string | undefined {
        const diffInTime = endWeek.startDate.getTime() - startWeek.startDate.getTime();
        const diffInDays = diffInTime / (24 * 60 * 60 * 1000);
        const diffInWeek = diffInDays / 7 + 1;

        const firstFlight = sortedFlights[0];
        const startDate = firstFlight.date;
        const allDays = Array.range(0, diffInWeek - 1).map(d => {
          return new Date(startDate).addDays(d * 7);
        });
        if (!sourceFlight.legs.some((l, index) => sortedFlights.some(f => l.std.compare(f.legs[index].std) !== 0))) {
          return undefined;
        } else {
          const groupCancleDay = allDays.reduce<{ change?: string; dates: Date[] }[]>((acc, cur) => {
            const lastElement: { change?: string; dates: Date[] } = acc[acc.length - 1] || (acc.push({ dates: [] as Date[] }) && acc[acc.length - 1]);
            const flight = flights.find(f => f.date.getDatePart().getTime() == cur.getTime());
            if (!flight || sourceFlight.legs.every((l, index) => l.std.compare(flight.legs[index].std) === 0)) {
              lastElement.dates.length > 0 && acc.push({ dates: [] as Date[] });
            } else {
              const _change = `${dataTypes.daytime.convertBusinessToView(flight.legs[0].std)}-${dataTypes.daytime.convertBusinessToView(flight.legs[flight.legs.length - 1].sta)}`;
              if (lastElement.change === _change) {
                lastElement.dates.push(cur);
              } else {
                acc.push({ change: _change, dates: [cur] });
              }
            }
            return acc;
          }, []);

          return groupCancleDay
            .map(n =>
              n.dates.length >= 2
                ? `TIM ${n.change} ${n.dates[0].getUTCDate()}/${ShortMonthNames[n.dates[0].getMonth()]} TILL ${n.dates[n.dates.length - 1].getUTCDate()}/${
                    ShortMonthNames[n.dates[n.dates.length - 1].getMonth()]
                  }`
                : n.dates.length === 1
                ? `TIM ${n.change} ${n.dates[0].getUTCDate()}/${ShortMonthNames[n.dates[0].getMonth()]}`
                : undefined
            )
            .filter(Boolean)
            .join(',');
        }
      }

      function generateRegisterChangeNotes(): string | undefined {
        const diffInTime = endWeek.startDate.getTime() - startWeek.startDate.getTime();
        const diffInDays = diffInTime / (24 * 60 * 60 * 1000);
        const diffInWeek = diffInDays / 7 + 1;

        const firstFlight = sortedFlights[0];
        const startDate = firstFlight.date;
        const allDays = Array.range(0, diffInWeek - 1).map(d => {
          return new Date(startDate).addDays(d * 7);
        });
        if (!sortedFlights.some(f => f.aircraftRegister !== sourceFlight.aircraftRegister)) {
          return undefined;
        } else {
          const groupCancleDay = allDays.reduce<{ change?: string; dates: Date[] }[]>((acc, cur) => {
            const lastElement: { change?: string; dates: Date[] } = acc[acc.length - 1] || (acc.push({ dates: [] as Date[] }) && acc[acc.length - 1]);
            const flight = flights.find(f => f.date.getDatePart().getTime() == cur.getTime());
            if (!flight || sourceFlight.aircraftRegister === flight.aircraftRegister) {
              lastElement.dates.length > 0 && acc.push({ dates: [] as Date[] });
            } else {
              const _change = flight.aircraftRegister?.['name'];
              if (lastElement.change === _change) {
                lastElement.dates.push(cur);
              } else {
                acc.push({ change: _change, dates: [cur] });
              }
            }
            return acc;
          }, []);

          return groupCancleDay
            .map(n =>
              n.dates.length >= 2
                ? `REG ${n.change} ${n.dates[0].getUTCDate()}/${ShortMonthNames[n.dates[0].getMonth()]} TILL ${n.dates[n.dates.length - 1].getUTCDate()}/${
                    ShortMonthNames[n.dates[n.dates.length - 1].getMonth()]
                  }`
                : n.dates.length === 1
                ? `REG ${n.change} ${n.dates[0].getUTCDate()}/${ShortMonthNames[n.dates[0].getMonth()]}`
                : undefined
            )
            .filter(Boolean)
            .join(',');
        }
      }

      function generatePermissionAndPermissionNotesChangeNotes(): string | undefined {
        const diffInTime = endWeek.startDate.getTime() - startWeek.startDate.getTime();
        const diffInDays = diffInTime / (24 * 60 * 60 * 1000);
        const diffInWeek = diffInDays / 7 + 1;

        const firstFlight = sortedFlights[0];
        const startDate = firstFlight.date;
        const allDays = Array.range(0, diffInWeek - 1).map(d => {
          return new Date(startDate).addDays(d * 7);
        });

        const groupCancleDay = allDays.reduce<{ change?: string; dates: Date[] }[]>((acc, cur) => {
          const lastElement: { change?: string; dates: Date[] } = acc[acc.length - 1] || (acc.push({ dates: [] as Date[] }) && acc[acc.length - 1]);
          const flight = flights.find(f => f.date.getDatePart().getTime() == cur.getTime());
          if (!flight || (sourceFlight.destinationPermission === flight.destinationPermission && sourceFlight.originPermission === flight.originPermission)) {
            lastElement.dates.length > 0 && acc.push({ dates: [] as Date[] });
          } else {
            const _change = 'PermissionChagne';
            if (lastElement.change === _change) {
              lastElement.dates.push(cur);
            } else {
              acc.push({ change: _change, dates: [cur] });
            }
          }
          return acc;
        }, []);

        return groupCancleDay
          .map(n =>
            n.dates.length >= 2
              ? `PER ${n.dates[0].getUTCDate()}/${ShortMonthNames[n.dates[0].getMonth()]} TILL ${n.dates[n.dates.length - 1].getUTCDate()}/${
                  ShortMonthNames[n.dates[n.dates.length - 1].getMonth()]
                }`
              : n.dates.length === 1
              ? `PER ${n.dates[0].getUTCDate()}/${ShortMonthNames[n.dates[0].getMonth()]}`
              : undefined
          )
          .filter(Boolean)
          .join(',');
      }

      function generateNotesChangeNotes(): string | undefined {
        const diffInTime = endWeek.startDate.getTime() - startWeek.startDate.getTime();
        const diffInDays = diffInTime / (24 * 60 * 60 * 1000);
        const diffInWeek = diffInDays / 7 + 1;

        const firstFlight = sortedFlights[0];
        const startDate = firstFlight.date;
        const allDays = Array.range(0, diffInWeek - 1).map(d => {
          return new Date(startDate).addDays(d * 7);
        });

        const groupCancleDay = allDays.reduce<{ change?: string; dates: Date[] }[]>((acc, cur) => {
          const lastElement: { change?: string; dates: Date[] } = acc[acc.length - 1] || (acc.push({ dates: [] as Date[] }) && acc[acc.length - 1]);
          const flight = flights.find(f => f.date.getDatePart().getTime() == cur.getTime());
          if (!flight || sourceFlight.notes === flight.notes) {
            lastElement.dates.length > 0 && acc.push({ dates: [] as Date[] });
          } else {
            const _change = 'Note change';
            if (lastElement.change === _change) {
              lastElement.dates.push(cur);
            } else {
              acc.push({ change: _change, dates: [cur] });
            }
          }
          return acc;
        }, []);

        return groupCancleDay
          .map(n =>
            n.dates.length >= 2
              ? `NTE ${n.dates[0].getUTCDate()}/${ShortMonthNames[n.dates[0].getMonth()]} TILL ${n.dates[n.dates.length - 1].getUTCDate()}/${
                  ShortMonthNames[n.dates[n.dates.length - 1].getMonth()]
                }`
              : n.dates.length === 1
              ? `NTE ${n.dates[0].getUTCDate()}/${ShortMonthNames[n.dates[0].getMonth()]}`
              : undefined
          )
          .filter(Boolean)
          .join(',');
      }

      function generateRsxChangeNotes(): string | undefined {
        const diffInTime = endWeek.startDate.getTime() - startWeek.startDate.getTime();
        const diffInDays = diffInTime / (24 * 60 * 60 * 1000);
        const diffInWeek = diffInDays / 7 + 1;

        const firstFlight = sortedFlights[0];
        const startDate = firstFlight.date;
        const allDays = Array.range(0, diffInWeek - 1).map(d => {
          return new Date(startDate).addDays(d * 7);
        });

        if (!sortedFlights.some(f => f.rsx !== sourceFlight.rsx)) return undefined;

        const groupChangeDay = allDays.reduce<{ change?: string; dates: Date[] }[]>((acc, cur) => {
          const lastElement: { change?: string; dates: Date[] } = acc[acc.length - 1] || (acc.push({ dates: [] as Date[] }) && acc[acc.length - 1]);
          const flight = flights.find(f => f.date.getDatePart().getTime() == cur.getTime());
          if (!flight || sourceFlight.rsx === flight.rsx) {
            lastElement.dates.length > 0 && acc.push({ dates: [] as Date[] });
          } else {
            const _change = flight.rsx;
            if (lastElement.change === _change) {
              lastElement.dates.push(cur);
            } else {
              acc.push({ change: _change, dates: [cur] });
            }
          }
          return acc;
        }, []);

        return groupChangeDay
          .map(n =>
            n.dates.length >= 2
              ? `RSX ${n.change} ${n.dates[0].getUTCDate()}/${ShortMonthNames[n.dates[0].getMonth()]} TILL ${n.dates[n.dates.length - 1].getUTCDate()}/${
                  ShortMonthNames[n.dates[n.dates.length - 1].getMonth()]
                }`
              : n.dates.length === 1
              ? `RSX ${n.change} ${n.dates[0].getUTCDate()}/${ShortMonthNames[n.dates[0].getMonth()]}`
              : undefined
          )
          .filter(Boolean)
          .join(',');
      }
    }
  }

  private static idCounter: number = 0;
}
