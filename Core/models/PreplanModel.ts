import AutoArrangerOptionsModel from './AutoArrangerOptionsModel';
import DummyAircraftRegisterModel from './DummyAircraftRegisterModel';
import FlightRequirementModel from './flight/FlightRequirementModel';
import AutoArrangerStateModel from './AutoArrangerStateModel';
import { AircraftRegisterOptionsDictionaryModel } from './AircraftRegisterOptionsModel';
import Validation from '@core/utils/Validation';

export interface PreplanHeaderModel {
  readonly id: string;

  readonly name: string;
  readonly published: boolean;
  readonly finalized: boolean;

  readonly userId: string;
  readonly userName: string;
  readonly userDisplayName: string;

  readonly parentPreplanId?: string;
  readonly parentPreplanName?: string;

  readonly creationDateTime: string;
  readonly lastEditDateTime: string;

  readonly startDate: string;
  readonly endDate: string;

  readonly simulationId?: string;
  readonly simulationName?: string;
}

export default interface PreplanModel extends PreplanHeaderModel {
  readonly autoArrangerOptions?: AutoArrangerOptionsModel;
  readonly autoArrangerState: AutoArrangerStateModel;

  readonly dummyAircraftRegisters: readonly DummyAircraftRegisterModel[];
  readonly aircraftRegisterOptionsDictionary: AircraftRegisterOptionsDictionaryModel;

  readonly flightRequirements: readonly FlightRequirementModel[];
}

// export interface NewPreplanHeaderModel {
//   readonly name: string;
//   readonly startDate: string;
//   readonly endDate: string;
// }
// export type NewPreplanHeaderValidationBadge =
//   | 'NAME_EXISTS'
//   | 'NAME_IS_LONG_ENOUGH'
//   | 'NAME_IS_VALID'
//   | 'START_DATE_EXISTS'
//   | 'START_DATE_IS_VALID'
//   | 'END_DATE_EXISTS'
//   | 'END_DATE_IS_VALID'
//   | 'START_DATE_BEFORE_END_DATE'
//   | 'END_DATE_AFTER_START_DATE';
// export type NewPreplanHeaderValidation = Validation<NewPreplanHeaderValidationBadge>;
// export function validateNewPreplanHeader(data: any): NewPreplanHeaderValidation {
//   const validation = new Validation<NewPreplanHeaderValidationBadge>({
//     NAME_IS_LONG_ENOUGH: 'At least 3 characters.',
//     NAME_IS_VALID: 'Invalid characters.',
//     START_DATE_BEFORE_END_DATE: 'Should be before end date.',
//     END_DATE_AFTER_START_DATE: 'Should be after start date.'
//   });
//   validation.object(data).do(({ name, startDate, endDate }) => {
//     validation
//       .check('NAME_EXISTS', name && typeof name === 'string')
//       .check('NAME_IS_LONG_ENOUGH', () => name.length >= 3)
//       .check('NAME_IS_VALID', () => /^[a-zA-Z0-9_+~!@#$%^&()=-]{3,}$/.test(name));
//     validation.check('START_DATE_EXISTS', startDate).check('START_DATE_IS_VALID', () => new Date(startDate).isValid());
//     validation.check('END_DATE_EXISTS', endDate).check('END_DATE_IS_VALID', () => new Date(endDate).isValid());
//     validation
//       .when('START_DATE_IS_VALID', 'END_DATE_IS_VALID')
//       .check('START_DATE_BEFORE_END_DATE', () => new Date(startDate).getDatePart() <= new Date(endDate).getDatePart())
//       .also('END_DATE_AFTER_START_DATE');
//   });
//   return validation;
// }

// export interface ModifyPreplanHeaderModel {
//   readonly name: string;
//   readonly published: boolean;
//   readonly startDate: string;
//   readonly endDate: string;
// }
// export type ModifyPreplanHeaderValidationBadge =
//   | 'NAME_EXISTS'
//   | 'NAME_IS_LONG_ENOUGH'
//   | 'NAME_IS_VALID'
//   | 'PUBLISHED_IS_VALID'
//   | 'START_DATE_EXISTS'
//   | 'START_DATE_IS_VALID'
//   | 'END_DATE_EXISTS'
//   | 'END_DATE_IS_VALID'
//   | 'START_DATE_BEFORE_END_DATE'
//   | 'END_DATE_AFTER_START_DATE';
// export type ModifyPreplanHeaderValidation = Validation<ModifyPreplanHeaderValidationBadge>;
// export function validateModifyPreplanHeader(data: any): ModifyPreplanHeaderValidation {
//   const validation = new Validation<ModifyPreplanHeaderValidationBadge>({
//     NAME_IS_LONG_ENOUGH: 'At least 3 characters.',
//     NAME_IS_VALID: 'Invalid characters.',
//     START_DATE_BEFORE_END_DATE: 'Should be before end date.',
//     END_DATE_AFTER_START_DATE: 'Should be after start date.'
//   });
//   validation.object(data).do(({ name, published, startDate, endDate }) => {
//     validation
//       .check('NAME_EXISTS', name && typeof name === 'string')
//       .check('NAME_IS_LONG_ENOUGH', () => name.length >= 3)
//       .check('NAME_IS_VALID', () => /^[a-zA-Z0-9_+~!@#$%^&()=-]{3,}$/.test(name));
//     validation.check('PUBLISHED_IS_VALID', typeof published === 'boolean');
//     validation.check('START_DATE_EXISTS', startDate).check('START_DATE_IS_VALID', () => new Date(startDate).isValid());
//     validation.check('END_DATE_EXISTS', endDate).check('END_DATE_IS_VALID', () => new Date(endDate).isValid());
//     validation
//       .when('START_DATE_IS_VALID', 'END_DATE_IS_VALID')
//       .check('START_DATE_BEFORE_END_DATE', () => new Date(startDate).getDatePart() <= new Date(endDate).getDatePart())
//       .also('END_DATE_AFTER_START_DATE');
//   });
//   return validation;
// }
