import FlightDefinitionModel, { FlightDefinitionValidation } from './FlightDefinitionModel';
import { FlightScopeModel, FlightScopeValidation } from './FlightScopeModel';
import WeekdayFlightRequirementModel, { WeekdayFlightRequirementValidation } from './WeekdayFlightRequirementModel';
import DummyAircraftRegisterModel from '../DummyAircraftRegisterModel';
import Validation from '@ahs502/validation';

export default interface FlightRequirementModel {
  readonly id: string;
  readonly definition: FlightDefinitionModel;
  readonly scope: FlightScopeModel;
  readonly days: readonly WeekdayFlightRequirementModel[];
  readonly ignored: boolean;
}

export class FlightRequirementValidation extends Validation<
  'IGNORED_IS_VALID',
  {
    readonly definition: FlightDefinitionValidation;
    readonly scope: FlightScopeValidation;
    readonly days: readonly WeekdayFlightRequirementValidation[];
  }
> {
  constructor(flightRequirement: FlightRequirementModel, dummyAircraftRegisters: readonly DummyAircraftRegisterModel[]) {
    super(validator =>
      validator.object(flightRequirement).do(({ definition, scope, days, ignored }) => {
        validator.into('definition').set(new FlightDefinitionValidation(definition));
        validator.into('scope').set(new FlightScopeValidation(scope, dummyAircraftRegisters));
        validator.array(days).each((day, index) => validator.into('days', index).set(new WeekdayFlightRequirementValidation(day, dummyAircraftRegisters)));
        validator.check('IGNORED_IS_VALID', typeof ignored === 'boolean');
      })
    );
  }
}
