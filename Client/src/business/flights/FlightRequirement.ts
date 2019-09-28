import FlightRequirementModel from '@core/models/flights/FlightRequirementModel';
import FlightDefinition from './FlightDefinition';
import FlightScope from './FlightScope';
import WeekdayFlightRequirement from './WeekdayFlightRequirement';
import { PreplanAircraftRegisters } from 'src/business/PreplanAircraftRegister';
import ModelConvertable, { getOverrided, getOverridedObject, getOverridedArray } from 'src/business/ModelConvertable';
import DeepWritablePartial from '@core/types/DeepWritablePartial';
import Objectionable, { ObjectionStatus } from 'src/business/constraints/Objectionable';
import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import Checker from 'src/business/constraints/Checker';

export default class FlightRequirement implements ModelConvertable<FlightRequirementModel>, Objectionable {
  readonly id: string;
  readonly definition: FlightDefinition;
  readonly scope: FlightScope;
  readonly days: readonly WeekdayFlightRequirement[];
  readonly ignored: boolean;

  objections?: Objection<FlightRequirement>[];

  constructor(raw: FlightRequirementModel, aircraftRegisters: PreplanAircraftRegisters) {
    this.id = raw.id!;
    this.definition = new FlightDefinition(raw.definition);
    this.scope = new FlightScope(raw.scope, aircraftRegisters);
    this.days = raw.days.map(d => new WeekdayFlightRequirement(d, this, aircraftRegisters)).sortBy(d => d.day);
    this.ignored = raw.ignored;
  }

  extractModel(overrides?: DeepWritablePartial<FlightRequirementModel>): FlightRequirementModel {
    return {
      id: getOverrided(this.id, overrides, 'id'),
      definition: getOverridedObject(this.definition, overrides, 'definition'),
      scope: getOverridedObject(this.scope, overrides, 'scope'),
      days: getOverridedArray(this.days, overrides, 'days'),
      ignored: getOverrided(this.ignored, overrides, 'ignored')
    };
  }

  get marker(): string {
    return `flight requirement ${this.definition.label} number ${this.definition.flightNumber} from ${this.definition.departureAirport.name} to ${this.definition.arrivalAirport.name}`;
  }

  get objectionStatus(): ObjectionStatus {
    if (!this.objections || this.objections.length === 0) return 'NONE';
    if (this.objections.some(o => o.type === 'ERROR')) return 'ERROR';
    return 'WARNING';
  }
  issueObjection(type: ObjectionType, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string): Objection<FlightRequirement> {
    return new Objection<FlightRequirement>(type, this, this.id, 2, priority, checker, messageProvider);
  }

  /**
   * Gets the day flight requirement of the specified day.
   * @param day The day of the period.
   */
  getDay(day: number): WeekdayFlightRequirement | undefined {
    return this.days.find(d => d.day === day);
  }
}
