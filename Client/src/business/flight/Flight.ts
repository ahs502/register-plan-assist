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
import ModelConvertable from 'src/business/ModelConvertable';
import { dataTypes } from 'src/utils/DataType';

export default class Flight implements ModelConvertable<FlightModel> {
  // Original:
  readonly id: Id;
  readonly aircraftRegister?: PreplanAircraftRegister;

  // Duplicates:
  readonly label: string;
  readonly category: string;
  readonly stc: Stc;
  readonly rsx: Rsx;
  readonly ignored: boolean;
  readonly day: Weekday;
  readonly notes: string;
  readonly originPermission: boolean | undefined;
  readonly destinationPermission: boolean | undefined;

  // References:
  readonly flightRequirement: FlightRequirement;
  readonly dayFlightRequirement: DayFlightRequirement;
  readonly aircraftRegisters: PreplanAircraftRegisters;
  readonly legs: readonly FlightLeg[];

  // Computational:
  readonly start: Daytime;
  readonly end: Daytime;
  readonly weekStart: number;
  readonly weekEnd: number;
  readonly sections: readonly {
    readonly start: number;
    readonly end: number;
  }[];
  readonly knownAircraftRegister: boolean;
  readonly icons: readonly string[]; //TODO: Check if it is really required.

  constructor(raw: FlightModel, dayFlightRequirement: DayFlightRequirement, aircraftRegisters: PreplanAircraftRegisters) {
    this.id = raw.id;
    this.aircraftRegister = raw.aircraftRegisterId === undefined ? undefined : aircraftRegisters.id[raw.aircraftRegisterId];

    this.label = dayFlightRequirement.flightRequirement.label;
    this.category = dayFlightRequirement.flightRequirement.category;
    this.stc = dayFlightRequirement.flightRequirement.stc;
    this.rsx = dayFlightRequirement.rsx;
    this.ignored = dayFlightRequirement.flightRequirement.ignored;
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

    this.start = this.legs[0].actualStd;
    this.end = this.legs[this.legs.length - 1].actualSta;
    this.weekStart = this.day * 24 * 60 + this.start.minutes;
    this.weekEnd = this.day * 24 * 60 + this.end.minutes;
    this.sections = this.legs.map(l => ({
      start: (l.weekStd - this.weekStart) / (this.weekEnd - this.weekStart),
      end: (l.weekSta - this.weekStart) / (this.weekEnd - this.weekStart)
    }));
    this.knownAircraftRegister = !!this.aircraftRegister && !this.aircraftRegister.dummy;
    this.icons = [];
  }

  extractModel(override?: (flightModel: FlightModel) => FlightModel): FlightModel {
    const flightModel: FlightModel = {
      id: this.id,
      flightRequirementId: this.flightRequirement.id,
      day: this.day,
      aircraftRegisterId: dataTypes.preplanAircraftRegister(this.aircraftRegisters).convertBusinessToModelOptional(this.aircraftRegister),
      legs: this.legs.map(l => l.extractModel())
    };
    return override?.(flightModel) ?? flightModel;
  }

  startDateTime(startDate: Date): Date {
    return new Date(startDate.getTime() + this.weekStart * 60 * 1000);
  }
  endDateTime(startDate: Date): Date {
    return new Date(startDate.getTime() + this.weekEnd * 60 * 1000);
  }
}
