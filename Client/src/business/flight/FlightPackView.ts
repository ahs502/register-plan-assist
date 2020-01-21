import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import { Stc } from 'src/business/master-data';
import Rsx from '@core/types/Rsx';
import Weekday from '@core/types/Weekday';
import Id from '@core/types/Id';
import Week from 'src/business/Week';
import Flight from 'src/business/flight/Flight';
import { ShortMonthNames } from '@core/types/MonthName';
import FlightLegPackView from 'src/business/flight/FlightLegPackView';

export default class FlightPackView {
  // Original:
  readonly aircraftRegister?: PreplanAircraftRegister;
  readonly legs: readonly FlightLegPackView[];

  // References:
  readonly aircraftRegisters: PreplanAircraftRegisters;
  readonly flightRequirement: FlightRequirement;
  readonly dayFlightRequirement: DayFlightRequirement;
  readonly flights: readonly Flight[];

  // Duplicates:
  readonly label: string;
  readonly category: string;
  readonly stc: Stc;
  readonly rsx: Rsx;
  readonly day: Weekday;
  readonly notes: string | undefined;
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
  readonly flightDates: Date[];
  readonly canclationNote: string | undefined;
  readonly stdChangeNote: string | undefined;
  readonly blockTimeChangeNote: string | undefined;
  readonly originPermissionAndPermissionNotesChange: FlightLegPermission[];
  readonly destinationPermissionAndPermissionNotesChange: FlightLegPermission[];
  readonly rsxChangeNote: string | undefined;
  readonly hasTimeChange: boolean;

  readonly icons: readonly string[]; //TODO: Check if it is really required.

  constructor(flights: readonly Flight[], startWeek: Week, endWeek: Week, week: Week, preplanStartDate: Date, preplanEndDate: Date) {
    const sourceFlight = flights[0];

    this.aircraftRegister = sourceFlight.aircraftRegister;

    this.aircraftRegisters = sourceFlight.aircraftRegisters;
    this.flightRequirement = sourceFlight.flightRequirement;
    this.dayFlightRequirement = sourceFlight.dayFlightRequirement;
    this.flights = flights;

    this.legs = sourceFlight.legs.map(l => new FlightLegPackView(l, this, startWeek, endWeek, week));

    this.label = sourceFlight.label;
    this.category = sourceFlight.category;
    this.stc = sourceFlight.stc;
    this.rsx = sourceFlight.rsx;
    this.day = sourceFlight.day;

    this.originPermission = sourceFlight.originPermission;
    this.destinationPermission = sourceFlight.destinationPermission;

    this.derivedId = String((FlightPackView.idCounter = FlightPackView.idCounter === Number.MAX_SAFE_INTEGER ? 1 : FlightPackView.idCounter + 1));
    this.start = sourceFlight.start;
    this.end = sourceFlight.end;
    this.weekStart = sourceFlight.weekStart;
    this.weekEnd = sourceFlight.weekEnd;
    this.sections = sourceFlight.sections;

    // Fields which should be calculated for view:
    this.startDateTime = new Date(week.startDate.getTime() + this.weekStart * 60 * 1000);
    this.endDateTime = new Date(week.startDate.getTime() + this.weekEnd * 60 * 1000);
    this.icons = [];

    this.flightDates = flights.map(f => f.date);

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

    this.canclationNote = generateCanalationNotes();
    this.stdChangeNote = generateStdChangeNotes();
    this.blockTimeChangeNote = generateBlockTimeChangeNotes();
    this.originPermissionAndPermissionNotesChange = generateOriginPermissionAndPermissionNotesChangeNotes().filter(Boolean);
    this.destinationPermissionAndPermissionNotesChange = generateDestinationPermissionAndPermissionNotesChangeNotes().filter(Boolean);
    this.rsxChangeNote = generateRsxChangeNotes();

    this.hasTimeChange = sourceFlight.legs.some(
      (l, index) =>
        l.std.compare(sourceFlight.dayFlightRequirement.route[index].stdLowerBound) !== 0 || l.blockTime.compare(sourceFlight.dayFlightRequirement.route[index].blockTime) !== 0
    );

    function generateCanalationNotes(): string | undefined {
      if (diffInWeek === sortedFlights.length) {
        return undefined;
      } else {
        const groupCancleDay = allDays.reduce<Date[][]>((acc, cur) => {
          const lastElement: Date[] = acc[acc.length - 1] || (acc.push([] as Date[]) && acc[acc.length - 1]);
          if (flights.some(f => f.date.getDatePart().getTime() == cur.getTime())) {
            lastElement.length > 0 && acc.push([]);
          } else {
            lastElement.push(cur);
          }
          return acc;
        }, []);

        const result = groupCancleDay
          .map(n =>
            n.length >= 2
              ? `${n[0].getUTCDate()}${ShortMonthNames[n[0].getMonth()]} TILL ${n[n.length - 1].getUTCDate()}${ShortMonthNames[n[n.length - 1].getMonth()]}`
              : n.length === 1
              ? `${n[0].getUTCDate()}${ShortMonthNames[n[0].getMonth()]}`
              : undefined
          )
          .filter(Boolean)
          .join(', ');

        return result ? Weekday[sourceFlight.day].substr(0, 3) + ' CNL: ' + result : undefined;
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

    function generateOriginPermissionAndPermissionNotesChangeNotes(): FlightLegPermission[] {
      return sourceFlight.legs.map((l, index) => {
        let generatedNote = generateChangeNotes(
          (firstFlight, secondFlight) => firstFlight.legs[index].originPermission === secondFlight.legs[index].originPermission,
          flight => (flight.legs[index].originPermission ? 'OK' : 'NOT OK'),
          changes =>
            changes
              .map(n =>
                n.dates.length >= 2
                  ? `${n.change} ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]} TILL ${n.dates[n.dates.length - 1].getUTCDate()}${
                      ShortMonthNames[n.dates[n.dates.length - 1].getMonth()]
                    }`
                  : n.dates.length === 1
                  ? `${n.change} ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]}`
                  : undefined
              )
              .filter(Boolean)
              .join(',')
        );
        generatedNote = generatedNote ? Weekday[sourceFlight.day].substr(0, 3) + ': ' + generatedNote : '';
        const userNote = l.originPermissionNote ? Weekday[sourceFlight.day].substr(0, 3) + ': ' + l.originPermissionNote : '';
        return { legIndex: index, day: sourceFlight.day, generatedNote, userNote };
      });
    }

    function generateDestinationPermissionAndPermissionNotesChangeNotes(): FlightLegPermission[] {
      return sourceFlight.legs.map((l, index) => {
        let generatedNote = generateChangeNotes(
          (firstFlight, secondFlight) => firstFlight.legs[index].destinationPermission === secondFlight.legs[index].destinationPermission,
          flight => (flight.legs[index].destinationPermission ? 'OK' : 'NOT OK'),
          changes =>
            changes
              .map(n =>
                n.dates.length >= 2
                  ? `${n.change} ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]} TILL ${n.dates[n.dates.length - 1].getUTCDate()}${
                      ShortMonthNames[n.dates[n.dates.length - 1].getMonth()]
                    }`
                  : n.dates.length === 1
                  ? `${n.change} ${n.dates[0].getUTCDate()}${ShortMonthNames[n.dates[0].getMonth()]}`
                  : undefined
              )
              .filter(Boolean)
              .join(',')
        );
        generatedNote = generatedNote ? Weekday[sourceFlight.day].substr(0, 3) + ': ' + generatedNote : '';
        const userNote = l.destinationPermissionNote ? Weekday[sourceFlight.day].substr(0, 3) + ': ' + l.destinationPermissionNote : '';
        return { legIndex: index, day: sourceFlight.day, generatedNote, userNote };
      });
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

  public static create(flights: readonly Flight[], startWeek: Week, endWeek: Week, week: Week, preplanStartDate: Date, preplanEndDate: Date): FlightPackView[] {
    const groupFlights = flights.groupBy(f => f.legs.map(t => t.actualStd.minutes.toString() + t.blockTime.minutes.toString() + t.rsx).join());
    return Object.values(groupFlights).map(f => new FlightPackView(f, startWeek, endWeek, week, preplanStartDate, preplanEndDate));
  }

  private static idCounter: number = 0;
}

export interface FlightLegPermission {
  legIndex: number;
  day: number;
  generatedNote: string;
  userNote: string;
}
