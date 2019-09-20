import FlightRequirement from './FlightRequirement';
import FlightScope from './FlightScope';
import Flight from './Flight';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';
import { PreplanAircraftRegisters } from 'src/business/PreplanAircraftRegister';
import FlightDefinition from './FlightDefinition';
import ModelConvertable, { getOverrided, getOverridedObject } from 'src/business/ModelConvertable';
import DeepWritablePartial from '@core/types/DeepWritablePartial';
import Objectionable, { ObjectionStatus } from 'src/business/constraints/Objectionable';
import Weekday from '@core/types/Weekday';
import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import Checker from 'src/business/constraints/Checker';

export default class WeekdayFlightRequirement implements ModelConvertable<WeekdayFlightRequirementModel>, Objectionable {
  readonly requirement: FlightRequirement;
  readonly derivedId: string;
  readonly definition: FlightDefinition;
  readonly scope: FlightScope;
  readonly notes: string;
  readonly freezed: boolean;
  readonly day: number;
  readonly flight: Flight;

  objections?: Objection<WeekdayFlightRequirement>[];

  constructor(raw: WeekdayFlightRequirementModel, requirement: FlightRequirement, aircraftRegisters: PreplanAircraftRegisters) {
    this.derivedId = `${requirement.id}#${raw.day}`;
    this.requirement = requirement;
    this.definition = requirement.definition;
    this.scope = new FlightScope(raw.scope, aircraftRegisters);
    this.notes = raw.notes;
    this.freezed = raw.freezed;
    this.day = raw.day;
    this.flight = new Flight(raw.flight, this, aircraftRegisters);
  }

  extractModel(overrides?: DeepWritablePartial<WeekdayFlightRequirementModel>): WeekdayFlightRequirementModel {
    return {
      day: getOverrided(this.day, overrides, 'day'),
      notes: getOverrided(this.notes, overrides, 'notes'),
      scope: getOverridedObject(this.scope, overrides, 'scope'),
      freezed: getOverrided(this.freezed, overrides, 'freezed'),
      flight: getOverridedObject(this.flight, overrides, 'flight')
    };
  }

  get marker(): string {
    return `flight requirement ${this.definition.label} number ${this.definition.flightNumber} from ${this.definition.departureAirport.name} to ${
      this.definition.arrivalAirport.name
    } on ${Weekday[this.day]}s`;
  }

  get objectionStatus(): ObjectionStatus {
    const requirementObjectionStatus = this.requirement.objectionStatus;
    if (requirementObjectionStatus === 'ERROR') return 'ERROR';
    if (!this.objections || this.objections.length === 0) return requirementObjectionStatus;
    if (this.objections.some(o => o.type === 'ERROR')) return 'ERROR';
    return 'WARNING';
  }
  issueObjection(type: ObjectionType, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string): Objection<WeekdayFlightRequirement> {
    return new Objection<WeekdayFlightRequirement>(type, this, this.derivedId, 3, priority, checker, messageProvider);
  }
}
