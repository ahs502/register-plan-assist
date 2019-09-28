import FlightRequirement from './FlightRequirement';
import WeekdayFlightRequirement from './WeekdayFlightRequirement';
import { Stc, Airport } from '@core/master-data';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/business/PreplanAircraftRegister';
import FlightModel from '@core/models/flights/FlightModel';
import Rsx from '@core/types/flight-requirement/Rsx';
import FlightPack from './FlightPack';
import ModelConvertable, { getOverrided } from 'src/business/ModelConvertable';
import DeepWritablePartial from '@core/types/DeepWritablePartial';
import Objectionable, { ObjectionStatus } from 'src/business/constraints/Objectionable';
import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import Checker from 'src/business/constraints/Checker';
import Weekday from '@core/types/Weekday';

export default class Flight implements ModelConvertable<FlightModel>, Objectionable {
  // Original:
  readonly std: Daytime;
  readonly aircraftRegister?: PreplanAircraftRegister;

  // Duplicated:
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

  // Computational:
  readonly international: boolean;
  readonly weekStd: number;
  readonly weekSta: number;

  // To be set when initiating its flight pack:
  readonly pack!: FlightPack;
  readonly transit!: boolean;

  // Inherited:
  objections?: Objection[];

  constructor(raw: FlightModel, weekdayRequiremnet: WeekdayFlightRequirement, aircraftRegisters: PreplanAircraftRegisters) {
    this.std = new Daytime(raw.std);
    this.aircraftRegister = raw.aircraftRegisterId ? aircraftRegisters.id[raw.aircraftRegisterId] : undefined;

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

  get marker(): string {
    return `flight ${this.label} number ${this.flightNumber} from ${this.departureAirport.name} to ${this.arrivalAirport.name} on ${Weekday[this.day]}s`;
  }

  get objectionStatus(): ObjectionStatus {
    const weekdayRequirementObjectionStatus = this.weekdayRequirement.objectionStatus;
    if (weekdayRequirementObjectionStatus === 'ERROR') return 'ERROR';
    if (!this.objections || this.objections.length === 0) return weekdayRequirementObjectionStatus;
    if (this.objections.some(o => o.type === 'ERROR')) return 'ERROR';
    return 'WARNING';
  }
  issueObjection(type: ObjectionType, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string): Objection<Flight> {
    return new Objection<Flight>(type, this, this.derivedId, 1, priority, checker, messageProvider);
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
