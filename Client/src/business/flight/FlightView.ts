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
import { MonthNames } from '@core/types/MonthName';

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
      const canclationOrActiveationPerDay: string = generateCanalationOrActivationNotes();
      const timeChange: string = ''; //TODO implement
      const registerChange: string = ''; //TODO implement
      const permissionChangeAndPermissionComment: string = ''; //TODO implement
      const flightComments: string = ''; //TODO implement

      return canclationOrActiveationPerDay;

      function generateCanalationOrActivationNotes(): string {
        const diffInTime = endWeek.startDate.getTime() - startWeek.startDate.getTime();
        const diffInDays = diffInTime / (24 * 60 * 60 * 1000);
        const diffInWeek = diffInDays / 7 + 1;
        const sortedFlights = flights.orderBy('date');
        const firstFlight = sortedFlights[0];
        const startDate = firstFlight.date;
        const allDays = Array.range(0, diffInWeek - 1).map(d => {
          return new Date(startDate).addDays(d * 7);
        });
        if (diffInWeek === sortedFlights.length) {
          return '';
        } else {
          if (firstFlight.date.getDatePart().getTime() === allDays[0].getTime()) {
            const groupCancleDay = allDays.reduce<Date[][]>((acc, cur, self) => {
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
                  ? `CNL ${n[0].getUTCDate()}/${MonthNames[n[0].getMonth()]} TILL ${n[n.length - 1].getUTCDate()}/${MonthNames[n[n.length - 1].getMonth()]}`
                  : n.length === 1
                  ? `CNL ${n[0].getUTCDate()}/${MonthNames[n[0].getMonth()]}`
                  : ''
              )
              .join(',');
          } else {
            const groupActiveDay = allDays.reduce<Date[][]>((acc, cur, self) => {
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
                  ? `FM ${n[0].getUTCDate()}/${MonthNames[n[0].getMonth()]} TILL ${n[n.length - 1].getUTCDate()}/${MonthNames[n[n.length - 1].getMonth()]}`
                  : n.length === 1
                  ? `FM ${n[0].getUTCDate()}/${MonthNames[n[0].getMonth()]}`
                  : ''
              )
              .join(',');
          }
        }
      }
    }
  }

  private static idCounter: number = 0;
}
