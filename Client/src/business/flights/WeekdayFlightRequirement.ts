import FlightRequirement from './FlightRequirement';
import FlightScope from './FlightScope';
import Flight from './Flight';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';
import { PreplanAircraftRegisters } from 'src/business/PreplanAircraftRegister';
import FlightDefinition from './FlightDefinition';
import ModelConvertable, { getOverrided, getOverridedObject } from 'src/utils/ModelConvertable';
import DeepWritablePartial from '@core/types/DeepWritablePartial';

export default class WeekdayFlightRequirement implements ModelConvertable<WeekdayFlightRequirementModel> {
  readonly requirement: FlightRequirement;
  readonly derivedId: string;
  readonly scope: FlightScope;
  readonly notes: string;
  readonly freezed: boolean;
  readonly day: number;
  readonly flight: Flight;

  constructor(raw: WeekdayFlightRequirementModel, requirement: FlightRequirement, aircraftRegisters: PreplanAircraftRegisters) {
    this.derivedId = `${requirement.id}#${raw.day}`;
    this.requirement = requirement;
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

  get definition(): FlightDefinition {
    return this.requirement.definition;
  }
}
