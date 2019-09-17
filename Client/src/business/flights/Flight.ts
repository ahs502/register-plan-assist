import FlightRequirement from './FlightRequirement';
import WeekdayFlightRequirement from './WeekdayFlightRequirement';
import { Stc, Airport } from '@core/master-data';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/business/PreplanAircraftRegister';
import FlightModel from '@core/models/flights/FlightModel';
import Rsx from '@core/types/flight-requirement/Rsx';
import FlightPack from './FlightPack';
import ModelConvertable, { getOverrided } from 'src/utils/ModelConvertable';
import DeepWritablePartial from '@core/types/DeepWritablePartial';

export default class Flight implements ModelConvertable<FlightModel> {
  readonly requirement: FlightRequirement;
  readonly weekdayRequirement: WeekdayFlightRequirement;
  readonly derivedId: string;
  readonly label: string;
  readonly category: string;
  readonly stc: Stc;
  readonly flightNumber: string;
  readonly departureAirport: Airport;
  readonly arrivalAirport: Airport;
  readonly notes: string;
  readonly freezed: boolean;
  readonly day: number;
  readonly blockTime: number;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;
  readonly rsx: Rsx;
  readonly required: boolean;
  readonly std: Daytime;
  readonly aircraftRegister?: PreplanAircraftRegister;

  readonly pack!: FlightPack; // To be set when initiating its flight pack.
  readonly transit!: boolean; // To be set when initiating its flight pack.

  readonly international: boolean;
  readonly weekStd: number;
  readonly weekSta: number;

  constructor(raw: FlightModel, weekdayRequiremnet: WeekdayFlightRequirement, aircraftRegisters: PreplanAircraftRegisters) {
    this.requirement = weekdayRequiremnet.requirement;
    this.weekdayRequirement = weekdayRequiremnet;
    this.derivedId = weekdayRequiremnet.derivedId;
    this.label = weekdayRequiremnet.definition.label;
    this.category = weekdayRequiremnet.definition.category;
    this.stc = weekdayRequiremnet.definition.stc;
    this.flightNumber = weekdayRequiremnet.definition.flightNumber;
    this.departureAirport = weekdayRequiremnet.definition.departureAirport;
    this.arrivalAirport = weekdayRequiremnet.definition.arrivalAirport;
    this.notes = weekdayRequiremnet.notes;
    this.freezed = weekdayRequiremnet.freezed;
    this.day = weekdayRequiremnet.day;
    this.blockTime = weekdayRequiremnet.scope.blockTime;
    this.originPermission = weekdayRequiremnet.scope.originPermission;
    this.destinationPermission = weekdayRequiremnet.scope.destinationPermission;
    this.rsx = weekdayRequiremnet.scope.rsx;
    this.required = weekdayRequiremnet.scope.required;
    this.std = new Daytime(raw.std);
    this.aircraftRegister = raw.aircraftRegisterId ? aircraftRegisters.id[raw.aircraftRegisterId] : undefined;

    this.international = this.departureAirport.international || this.arrivalAirport.international;
    this.weekStd = this.day * 24 * 60 + this.std.minutes;
    this.weekSta = this.day * 24 * 60 + this.std.minutes + this.blockTime;
  }

  extractModel(overrides?: DeepWritablePartial<FlightModel>): FlightModel {
    return {
      std: getOverrided(this.std.minutes, overrides, 'std'),
      aircraftRegisterId: getOverrided(this.aircraftRegister && this.aircraftRegister.id, overrides, 'aircraftRegisterId')
    };
  }

  stdDateTime(startDate: Date): Date {
    return new Date(startDate.getTime() + this.weekStd * 60 * 1000);
  }
  staDateTime(startDate: Date): Date {
    return new Date(startDate.getTime() + this.weekSta * 60 * 1000);
  }

  getRequiredMinimumGroundTime(startDate: Date, endDate?: Date, method: 'MAXIMUM' | 'MINIMUM' = 'MAXIMUM'): number {
    if (!this.aircraftRegister) return 0;
    return this.aircraftRegister.getMinimumGroundTime(this.transit, this.international, startDate, endDate, method);
  }
}
