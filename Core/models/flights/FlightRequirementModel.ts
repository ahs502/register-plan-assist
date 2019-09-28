import FlightDefinitionModel from './FlightDefinitionModel';
import FlightScopeModel from './FlightScopeModel';
import WeekdayFlightRequirementModel from './WeekdayFlightRequirementModel';
import DummyAircraftRegisterModel from '../DummyAircraftRegisterModel';
import Validation from '@ahs502/validation';

export default interface FlightRequirementModel {
  readonly id?: string;
  readonly definition: FlightDefinitionModel;
  readonly scope: FlightScopeModel;
  readonly days: readonly WeekdayFlightRequirementModel[];
  readonly ignored: boolean;
}

// export class FlightRequirementValidation extends Validation<
//   'IGNORED_IS_VALID',
//   {
//     readonly definition: FlightDefinitionValidation;
//     readonly scope: FlightScopeValidation;
//     readonly days: readonly WeekdayFlightRequirementValidation[];
//   }
// > {
//   constructor(flightRequirement: FlightRequirementModel, dummyAircraftRegistersId: readonly string[]) {
//     super(
//       validator => {}
//       // validator.object(flightRequirement).do(({ definition, scope, days, ignored }) => {
//       //   validator.into('definition').set(new FlightDefinitionValidation(definition));
//       //   validator.into('scope').set(new FlightScopeValidation(scope, dummyAircraftRegistersId));
//       //   validator.array(days).each((day, index) => validator.into('days', index).set(new WeekdayFlightRequirementValidation(day, dummyAircraftRegistersId)));
//       //   validator.check('IGNORED_IS_VALID', typeof ignored === 'boolean');
//       // })
//     );
//   }
// }
