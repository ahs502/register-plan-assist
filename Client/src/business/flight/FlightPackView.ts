import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import { Stc } from 'src/business/master-data';
import Rsx from '@core/types/Rsx';
import Weekday, { Weekdays } from '@core/types/Weekday';
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
  readonly hasTimeChange: boolean;
  readonly inDstChange: boolean;
  readonly permissions: FlightLegPermission;
  readonly icons: readonly string[]; //TODO: Check if it is really required.

  constructor(flights: readonly Flight[], startWeek: Week, endWeek: Week, week: Week, preplanStartDate: Date, preplanEndDate: Date) {
    const sourceFlight = flights[0];

    this.aircraftRegister = sourceFlight.aircraftRegister;

    this.aircraftRegisters = sourceFlight.aircraftRegisters;
    this.flightRequirement = sourceFlight.flightRequirement;
    this.dayFlightRequirement = sourceFlight.dayFlightRequirement;
    this.flights = flights;

    this.legs = sourceFlight.legs.map(l => new FlightLegPackView(l, this, week));

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

    const flightAirports = sourceFlight.legs
      .map(l => l.departureAirport)
      .concat(sourceFlight.legs.map(l => l.arrivalAirport))
      .distinct();

    const allDays = Array.range(0, diffInWeek - 1).map(d => {
      return new Date(startDate).addDays(d * 7);
    });

    if (allDays[0] < preplanStartDate) allDays.shift();
    if (allDays[allDays.length - 1] > preplanEndDate) allDays.pop();

    const utcOffsets = flightAirports
      .map(a => a.utcOffsets.find(u => u.dst && u.startDateTimeUtc.getTime() <= sourceFlight.date.getTime() && sourceFlight.date.getTime() <= u.endDateTimeUtc.getTime()))
      .filter(Boolean);

    utcOffsets.forEach(u => {
      if (u === undefined) return;
      while (allDays[0].getTime() < u.startDateTimeUtc.getTime()) {
        allDays.shift();
      }
      while (allDays[allDays.length - 1].getTime() > u.endDateTimeUtc.getTime()) {
        allDays.pop();
      }
    });

    if (utcOffsets.length === 0) {
      flightAirports.forEach(a => {
        a.utcOffsets
          .orderBy(n => n.startDateTimeUtc)
          .forEach(u => {
            if (!u.dst) return;
            while (allDays[0].getTime() < u.endDateTimeUtc.getTime() && u.endDateTimeUtc.getTime() < allDays[allDays.length - 1].getTime()) {
              allDays.shift();
            }
            while (allDays[allDays.length - 1].getTime() > u.startDateTimeUtc.getTime() && u.startDateTimeUtc.getTime() > allDays[0].getTime()) {
              allDays.pop();
            }
          });
      });
    }
    const sortedFlights = flights.orderBy('date');

    this.hasTimeChange = sourceFlight.legs.some(
      (l, index) =>
        l.std.compare(sourceFlight.dayFlightRequirement.route[index].stdLowerBound) !== 0 || l.blockTime.compare(sourceFlight.dayFlightRequirement.route[index].blockTime) !== 0
    );

    this.inDstChange = false;
    for (let index = 0; index < flightAirports.length; index++) {
      const airport = flightAirports[index];
      this.inDstChange =
        this.legs
          .map(n => (n.departureAirport === airport ? n.hasDstInDeparture : n.arrivalAirport == airport ? n.hasDstInArrival : undefined))
          .filter(f => f !== undefined)
          .distinct().length > 1;
      if (this.inDstChange) break;
    }

    this.canclationNote = generateCanalationNotes();
    this.permissions = generateFlightLegPermission();

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

    function generateFlightLegPermission(): FlightLegPermission {
      const result: FlightLegPermission = {};
      for (let legIndex = 0; legIndex < sourceFlight.legs.length; legIndex++) {
        result[legIndex] = {} as FlightLegPermission[number];
        const legs = sortedFlights.map(f => f.legs[legIndex]);
        for (let day = 0; day < Weekdays.length; day++) {
          const dayLegs = legs.filter(l => l.day === day);
          if (dayLegs.length === 0) continue;
          const firstLeg = dayLegs[0];
          result[legIndex][day] = {
            destinationPermissions: [
              { fromDate: firstLeg.utcStd, toDate: firstLeg.utcStd, userNote: firstLeg.destinationPermissionNote, hasPermission: firstLeg.destinationPermission }
            ],
            originPermissions: [{ fromDate: firstLeg.utcStd, toDate: firstLeg.utcStd, userNote: firstLeg.originPermissionNote, hasPermission: firstLeg.originPermission }]
          };
          for (let index = 0; index < dayLegs.length; index++) {
            const leg = dayLegs[index];

            const lastDestinationPermission = result[legIndex][day].destinationPermissions.last()!;
            if (lastDestinationPermission.userNote === leg.destinationPermissionNote && lastDestinationPermission.hasPermission === leg.destinationPermission) {
              lastDestinationPermission.toDate = leg.utcStd;
            } else {
              result[legIndex][day].destinationPermissions.push({
                fromDate: leg.utcStd,
                toDate: leg.utcStd,
                userNote: leg.destinationPermissionNote,
                hasPermission: leg.destinationPermission
              });
            }

            const lastOriginPermission = result[legIndex][day].originPermissions.last()!;
            if (lastOriginPermission.userNote === leg.originPermissionNote && lastOriginPermission.hasPermission === leg.originPermission) {
              lastOriginPermission.toDate = leg.utcStd;
            } else {
              result[legIndex][day].originPermissions.push({
                fromDate: leg.utcStd,
                toDate: leg.utcStd,
                userNote: leg.originPermissionNote,
                hasPermission: leg.originPermission
              });
            }
          }
        }
      }

      return result;
    }
  }

  public static create(flights: readonly Flight[], startWeek: Week, endWeek: Week, week: Week, preplanStartDate: Date, preplanEndDate: Date): FlightPackView[] {
    const groupFlights = flights.groupBy(f =>
      f.legs.map(t => t.localStd.getUTCHours().toString() + t.localStd.getUTCMinutes().toString() + t.blockTime.minutes.toString() + t.rsx).join()
    );
    return Object.values(groupFlights).map(f => new FlightPackView(f, startWeek, endWeek, week, preplanStartDate, preplanEndDate));
  }

  private static idCounter: number = 0;
}

export interface FlightLegPermission {
  [legIndex: number]: {
    [day: number]: {
      originPermissions: Permission[];
      destinationPermissions: Permission[];
    };
  };
}

interface Permission {
  fromDate: Date;
  toDate: Date;
  userNote: string | undefined;
  hasPermission: boolean;
}
