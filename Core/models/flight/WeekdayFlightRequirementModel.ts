import { FlightScopeModel, FlightScopeValidation } from './FlightScopeModel';
import FlightModel, { FlightValidation } from './FlightModel';
import Validation from '@core/utils/Validation';
import DummyAircraftRegisterModel from '../DummyAircraftRegisterModel';

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
  constructor(data: any, dummyAircraftRegisters: readonly DummyAircraftRegisterModel[]) {
    super(validator =>
      validator.object(data).do(({ scope, notes, day, flight }) => {
        validator.in('scope').set(new FlightScopeValidation(scope, dummyAircraftRegisters));
        validator.check('NOTES_IS_VALID', typeof notes === 'string');
        validator.check('DAY_IS_VALID', typeof day === 'number' && !isNaN(day) && day >= 0 && day < 7);
        validator.in('flight').set(new FlightValidation(flight, dummyAircraftRegisters));
      })
    );
  }
}
