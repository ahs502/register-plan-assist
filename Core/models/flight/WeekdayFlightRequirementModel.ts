import { FlightScopeModel, FlightScopeValidation } from './FlightScopeModel';
import FlightModel, { FlightValidation } from './FlightModel';
import DummyAircraftRegisterModel from '../DummyAircraftRegisterModel';
import Validation from '@ahs502/validation';

export default interface WeekdayFlightRequirementModel {
  readonly scope: FlightScopeModel;
  readonly notes: string;
  readonly day: number;
  readonly flight: FlightModel;
}

export class WeekdayFlightRequirementValidation extends Validation<
  'NOTES_IS_VALID' | 'DAY_IS_VALID',
  {
    readonly scope: FlightScopeValidation;
    readonly flight: FlightValidation;
  }
> {
  constructor(weekdayFlightRequirement: WeekdayFlightRequirementModel, dummyAircraftRegisters: readonly DummyAircraftRegisterModel[]) {
    super(validator =>
      validator.object(weekdayFlightRequirement).do(({ scope, notes, day, flight }) => {
        validator.into('scope').set(new FlightScopeValidation(scope, dummyAircraftRegisters));
        validator.check('NOTES_IS_VALID', typeof notes === 'string');
        validator.check('DAY_IS_VALID', typeof day === 'number' && !isNaN(day) && day >= 0 && day < 7);
        validator.into('flight').set(new FlightValidation(flight, dummyAircraftRegisters));
      })
    );
  }
}
