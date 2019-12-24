import ModelConvertable from 'src/business/ModelConvertable';
import FlightChangeModel from '@core/models/flight/FlightChangeModel';
import Flight from 'src/business/flight/Flight';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import FlightLegChange from 'src/business/flight/FlightLegChange';
import { dataTypes } from 'src/utils/DataType';

export default class FlightChange implements ModelConvertable<FlightChangeModel> {
  // Original:
  readonly startDate: Date;
  readonly endDate: Date;
  readonly aircraftRegister?: PreplanAircraftRegister;
  readonly legs: readonly FlightLegChange[];

  //    // Duplicates:
  //    readonly label: string;
  //    readonly category: string;
  //    readonly stc: Stc;
  //    readonly rsx: Rsx;
  //    readonly ignored: boolean;
  //    readonly day: Weekday;
  //    readonly notes: string;
  //    readonly originPermission: boolean | undefined;
  //    readonly destinationPermission: boolean | undefined;

  //    // References:
  //    readonly flightRequirement: FlightRequirement;
  //    readonly dayFlightRequirement: DayFlightRequirement;
  readonly aircraftRegisters: PreplanAircraftRegisters;

  //    // Computational:
  //    readonly start: Daytime;
  //    readonly end: Daytime;
  //    readonly weekStart: number;
  //    readonly weekEnd: number;
  //    readonly sections: readonly {
  //      readonly start: number;
  //      readonly end: number;
  //    }[];
  //    readonly knownAircraftRegister: boolean;
  //    readonly icons: readonly string[]; //TODO: Check if it is really required.

  constructor(raw: FlightChangeModel, flight: Flight, aircraftRegisters: PreplanAircraftRegisters) {
    this.startDate = dataTypes.utcDate.convertModelToBusiness(raw.startDate);
    this.endDate = dataTypes.utcDate.convertModelToBusiness(raw.endDate);
    this.aircraftRegister = dataTypes.preplanAircraftRegister(aircraftRegisters).convertModelToBusinessOptional(raw.aircraftRegisterId);
    this.legs = raw.legs.map(l => new FlightLegChange(l));

    // this.label = dayFlightRequirement.flightRequirement.label;
    // this.category = dayFlightRequirement.flightRequirement.category;
    // this.stc = dayFlightRequirement.flightRequirement.stc;
    // this.rsx = dayFlightRequirement.rsx;
    // this.ignored = dayFlightRequirement.flightRequirement.ignored;
    // this.day = dayFlightRequirement.day;
    // this.notes = dayFlightRequirement.notes;
    // const originPermissions = dayFlightRequirement.route.map(l => l.originPermission).distinct();
    // this.originPermission = originPermissions.length === 2 ? undefined : originPermissions.length === 1 ? originPermissions[0] : false;
    // const destinationPermissions = dayFlightRequirement.route.map(l => l.destinationPermission).distinct();
    // this.destinationPermission = destinationPermissions.length === 2 ? undefined : destinationPermissions.length === 1 ? destinationPermissions[0] : false;

    // this.flightRequirement = dayFlightRequirement.flightRequirement;
    // this.dayFlightRequirement = dayFlightRequirement;
    this.aircraftRegisters = aircraftRegisters;

    // let dayOffset = 0;
    // let previousSta = Number.NEGATIVE_INFINITY;
    // const legs: FlightLeg[] = (this.legs = []);
    // raw.legs.forEach((leg, index) => {
    //   let std = leg.std + dayOffset * 24 * 60;
    //   while (std <= previousSta) {
    //     dayOffset++;
    //     std += 24 * 60;
    //   }
    //   legs.push(new FlightLeg(leg, dayOffset, this, dayFlightRequirement.route[index]));
    //   previousSta = std + dayFlightRequirement.route[index].blockTime.minutes;
    // });

    // this.start = this.legs[0].actualStd;
    // this.end = this.legs[this.legs.length - 1].actualSta;
    // this.weekStart = this.day * 24 * 60 + this.start.minutes;
    // this.weekEnd = this.day * 24 * 60 + this.end.minutes;
    // this.sections = this.legs.map(l => ({
    //   start: (l.weekStd - this.weekStart) / (this.weekEnd - this.weekStart),
    //   end: (l.weekSta - this.weekStart) / (this.weekEnd - this.weekStart)
    // }));
    // this.knownAircraftRegister = !!this.aircraftRegister && !this.aircraftRegister.dummy;
    // this.icons = [];
  }

  extractModel(override?: (flightChangeModel: FlightChangeModel) => FlightChangeModel): FlightChangeModel {
    const flightChangeModel: FlightChangeModel = {
      startDate: dataTypes.utcDate.convertBusinessToModel(this.startDate),
      endDate: dataTypes.utcDate.convertBusinessToModel(this.endDate),
      aircraftRegisterId: dataTypes.preplanAircraftRegister(this.aircraftRegisters).convertBusinessToModelOptional(this.aircraftRegister),
      legs: this.legs.map(l => l.extractModel())
    };
    return override?.(flightChangeModel) ?? flightChangeModel;
  }
}
