import Validation from './Validation';

export default class PreplanValidator {
  static createEmptyValidate(
    name: any,
    startDate: any,
    endDate: any
  ): Validation<'NAME_REQUIRED' | 'START_DATE_REQUIRED' | 'START_DATE_IS_VALID' | 'END_DATE_REQUIRED' | 'END_DATE_IS_VALID' | 'START_DATE_BEFORE_END_DATE'> {
    const validation = new Validation();
    validation.check('name exsits', [], () => name, 'NAME_REQUIRED', 'Name is required.');
    validation.check('start date exists', [], () => startDate, 'START_DATE_REQUIRED', 'Start date is required.');
    validation.check('start date valid', ['start date exists'], () => new Date(startDate).isValid(), 'START_DATE_IS_VALID', 'Start date is invalid.');
    validation.check('end date exists', [], () => endDate, 'END_DATE_REQUIRED', 'End date is required.');
    validation.check('end date valid', ['end date exists'], () => new Date(endDate).isValid(), 'END_DATE_IS_VALID', 'End date is invalid.');
    validation.check(
      'start date before end date',
      ['start date valid', 'end date valid'],
      () => new Date(startDate) <= new Date(endDate),
      'START_DATE_BEFORE_END_DATE',
      'Start date must not be after end date.'
    );
    return validation;
  }
}
