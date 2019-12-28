import FlightModel from '@core/models/flight/FlightModel';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import FlightLeg from 'src/business/flight/FlightLeg';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import { Stc } from 'src/business/master-data';
import Rsx from '@core/types/Rsx';
import Weekday from '@core/types/Weekday';
import Id from '@core/types/Id';
import ModelConvertable from 'src/business/ModelConvertable';
import { dataTypes } from 'src/utils/DataType';
import FlightRequirementChange from 'src/business/flight-requirement/FlightRequirementChange';
import DayFlightRequirementChange from 'src/business/flight-requirement/DayFlightRequirementChange';
import Daytime from '@core/types/Daytime';

export default class Flight implements ModelConvertable<FlightModel> {
  // Original:
  readonly id: Id;
  readonly date: Date;
  readonly aircraftRegister?: PreplanAircraftRegister;
  readonly legs: readonly FlightLeg[];

  // References:
  readonly aircraftRegisters: PreplanAircraftRegisters;
  readonly flightRequirement: FlightRequirement;
  readonly dayFlightRequirement: DayFlightRequirement;
  readonly change?: {
    readonly flightRequirement: FlightRequirementChange;
    readonly dayFlightRequirement: DayFlightRequirementChange;
  };

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

  constructor(raw: FlightModel, aircraftRegisters: PreplanAircraftRegisters, dayFlightRequirement: DayFlightRequirement, dayFlightRequirementChange?: DayFlightRequirementChange) {
    this.id = raw.id;
    this.date = dataTypes.utcDate.convertModelToBusiness(raw.date);
    this.aircraftRegister = dataTypes.preplanAircraftRegister(aircraftRegisters).convertModelToBusinessOptional(raw.aircraftRegisterId);

    this.aircraftRegisters = aircraftRegisters;
    this.flightRequirement = dayFlightRequirement.flightRequirement;
    this.dayFlightRequirement = dayFlightRequirement;
    this.change = dayFlightRequirementChange && {
      flightRequirement: dayFlightRequirementChange.flightRequirementChange,
      dayFlightRequirement: dayFlightRequirementChange
    };

    this.label = dayFlightRequirement.flightRequirement.label;
    this.category = dayFlightRequirement.flightRequirement.category;
    this.stc = dayFlightRequirement.flightRequirement.stc;
    this.rsx = (this.change?.dayFlightRequirement ?? dayFlightRequirement).rsx;
    this.day = dayFlightRequirement.day;
    this.notes = (this.change?.dayFlightRequirement ?? dayFlightRequirement).notes;
    const originPermissions = (this.change?.dayFlightRequirement.route.map(l => l.originPermission) ?? dayFlightRequirement.route.map(l => l.originPermission)).distinct();
    this.originPermission = originPermissions.length === 2 ? undefined : originPermissions.length === 1 ? originPermissions[0] : false;
    const destinationPermissions = (
      this.change?.dayFlightRequirement.route.map(l => l.destinationPermission) ?? dayFlightRequirement.route.map(l => l.destinationPermission)
    ).distinct();
    this.destinationPermission = destinationPermissions.length === 2 ? undefined : destinationPermissions.length === 1 ? destinationPermissions[0] : false;

    let dayOffset = 0;
    let previousSta = Number.NEGATIVE_INFINITY;
    const legs: FlightLeg[] = (this.legs = []);
    raw.legs.forEach((l, index) => {
      let std = l.std + dayOffset * 24 * 60;
      while (std <= previousSta) {
        dayOffset++;
        std += 24 * 60;
      }
      legs.push(new FlightLeg(l, dayOffset, this, dayFlightRequirement.route[index], dayFlightRequirementChange && dayFlightRequirementChange.route[index]));
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
    this.startDateTime = new Date(this.date.getTime() + this.start.minutes * 60 * 1000);
    this.endDateTime = new Date(this.date.getTime() + this.end.minutes * 60 * 1000);
    this.icons = [];
  }

  extractModel(override?: (flightModel: FlightModel) => FlightModel): FlightModel {
    const flightModel: FlightModel = {
      id: this.id,
      flightRequirementId: this.flightRequirement.id,
      date: dataTypes.utcDate.convertBusinessToModel(this.date),
      aircraftRegisterId: dataTypes.preplanAircraftRegister(this.aircraftRegisters).convertBusinessToModelOptional(this.aircraftRegister),
      legs: this.legs.map(l => l.extractModel())
    };
    return override?.(flightModel) ?? flightModel;
  }
}
