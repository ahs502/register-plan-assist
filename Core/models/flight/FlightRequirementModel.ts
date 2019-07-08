import FlightDefinitionModel, { FlightDefinitionValidation } from './FlightDefinitionModel';
import { FlightScopeModel, FlightScopeValidation } from './FlightScopeModel';
import WeekdayFlightRequirementModel, { WeekdayFlightRequirementValidation } from './WeekdayFlightRequirementModel';
import Validation from '@core/utils/Validation';
import DummyAircraftRegisterModel from '../DummyAircraftRegisterModel';

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
  constructor(data: any, dummyAircraftRegisters: readonly DummyAircraftRegisterModel[]) {
    super(validator =>
      validator.object(data).do(({ definition, scope, days, ignored }) => {
        validator.in('definition').set(new FlightDefinitionValidation(definition));
        validator.in('scope').set(new FlightScopeValidation(scope, dummyAircraftRegisters));
        validator.array(days).for((day, index) => validator.in('days', index).set(new WeekdayFlightRequirementValidation(day, dummyAircraftRegisters)));
        validator.check('IGNORED_IS_VALID', typeof ignored === 'boolean');
      })
    );
  }
}
