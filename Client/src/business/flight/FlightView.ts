import FlightModel from '@core/models/flight/FlightModel';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import FlightLeg from 'src/business/flight/FlightLeg';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import { Stc } from 'src/business/master-data';
import Rsx from '@core/types/Rsx';
import Weekday from '@core/types/Weekday';
import Id from '@core/types/Id';
import { dataTypes } from 'src/utils/DataType';
import FlightLegView from 'src/business/flight/FlightLegView';
import Week from 'src/business/Week';
import Flight from 'src/business/flight/Flight';

export default class FlightView {
  // Original:
  readonly aircraftRegister?: PreplanAircraftRegister;
  readonly legs: readonly FlightLegView[];

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
  readonly icons: readonly string[]; //TODO: Check if it is really required.

  constructor(flights: readonly Flight[], startWeek: Week, endWeek: Week) {
    this.aircraftRegister = dataTypes.preplanAircraftRegister(aircraftRegisters).convertModelToBusinessOptional(raw.aircraftRegisterId);

    this.label = dayFlightRequirement.flightRequirement.label;
    this.category = dayFlightRequirement.flightRequirement.category;
    this.stc = dayFlightRequirement.flightRequirement.stc;
    this.rsx = dayFlightRequirement.rsx;
    this.day = dayFlightRequirement.day;
    this.notes = dayFlightRequirement.notes;
    const originPermissions = dayFlightRequirement.route.map(l => l.originPermission).distinct();
    this.originPermission = originPermissions.length === 2 ? undefined : originPermissions.length === 1 ? originPermissions[0] : false;
    const destinationPermissions = dayFlightRequirement.route.map(l => l.destinationPermission).distinct();
    this.destinationPermission = destinationPermissions.length === 2 ? undefined : destinationPermissions.length === 1 ? destinationPermissions[0] : false;

    this.flightRequirement = dayFlightRequirement.flightRequirement;
    this.dayFlightRequirement = dayFlightRequirement;
    this.aircraftRegisters = aircraftRegisters;

    let dayOffset = 0;
    let previousSta = Number.NEGATIVE_INFINITY;
    const legs: FlightLeg[] = (this.legs = []);
    raw.legs.forEach((leg, index) => {
      let std = leg.std + dayOffset * 24 * 60;
      while (std <= previousSta) {
        dayOffset++;
        std += 24 * 60;
      }
      legs.push(new FlightLeg(leg, dayOffset, this, dayFlightRequirement.route[index]));
      previousSta = std + dayFlightRequirement.route[index].blockTime.minutes;
    });

    this.derivedId = raw.id;
    this.start = this.legs[0].actualStd;
    this.end = this.legs[this.legs.length - 1].actualSta;
    this.weekStart = this.day * 24 * 60 + this.start.minutes;
    this.weekEnd = this.day * 24 * 60 + this.end.minutes;
    this.sections = this.legs.map(l => ({
      start: (l.weekStd - this.weekStart) / (this.weekEnd - this.weekStart),
      end: (l.weekSta - this.weekStart) / (this.weekEnd - this.weekStart)
    }));
    this.icons = [];
  }

  startDateTime(week: Week): Date {
    return new Date(week.startDate.getTime() + this.weekStart * 60 * 1000);
  }
  endDateTime(week: Week): Date {
    return new Date(week.startDate.getTime() + this.weekEnd * 60 * 1000);
  }
}
