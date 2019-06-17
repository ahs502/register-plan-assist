import Validation from './Validation';
import MasterData from '../business/master-data';
import { DummyAircraftRegisterModel } from '@business/AircraftRegister';

export default class PreplanValidator {
  static createEmptyValidate(
    name: any,
    startDate: any,
    endDate: any
  ): Validation<'NAME_REQUIRED' | 'START_DATE_REQUIRED' | 'START_DATE_IS_VALID' | 'END_DATE_REQUIRED' | 'END_DATE_IS_VALID' | 'START_DATE_BEFORE_END_DATE'> {
    const validation = new Validation();
    validation.check('name exsits', [], () => name, 'NAME_REQUIRED', 'Name is required.');
    validation.check('start date exists', [], () => startDate, 'START_DATE_REQUIRED', 'Start date is required.');
    validation.check('start date is valid', ['start date exists'], () => new Date(startDate).isValid(), 'START_DATE_IS_VALID', 'Start date is invalid.');
    validation.check('end date exists', [], () => endDate, 'END_DATE_REQUIRED', 'End date is required.');
    validation.check('end date is valid', ['end date exists'], () => new Date(endDate).isValid(), 'END_DATE_IS_VALID', 'End date is invalid.');
    validation.check(
      'start date is before end date',
      ['start date is valid', 'end date is valid'],
      () => new Date(startDate).getDatePart() <= new Date(endDate).getDatePart(),
      'START_DATE_BEFORE_END_DATE',
      'Start date must not be after end date.'
    );
    return validation;
  }

  static cloneValidate = PreplanValidator.createEmptyValidate;

  static editHeaderValidate = PreplanValidator.createEmptyValidate;

  static updateAutoArrangerOptionsValidate(autoArrangerOptions: any): Validation<'MGT_MODE_REQUIRED' | 'MGT_MODE_IS_VALID' | 'MGT_OFFSET_IS_VALID'> {
    const validation = new Validation();
    validation.check('data exsits', [], () => autoArrangerOptions);
    validation.check('mgt mode exsits', ['data exsits'], () => autoArrangerOptions.minimumGroundTimeMode, 'MGT_MODE_REQUIRED', 'Minimum ground time mode is required.');
    validation.check(
      'mgt_mode is valid',
      ['mgt mode exsits'],
      () => ['MINIMUM', 'MAXIMUM', 'AVERAGE'].includes(autoArrangerOptions.minimumGroundTimeMode),
      'MGT_MODE_IS_VALID',
      'Minimum ground time mode is invalid.'
    );
    validation.check(
      'mgt offset is valid',
      ['data exsits'],
      () => typeof autoArrangerOptions.minimumGroundTimeOffset === 'number' && !isNaN(autoArrangerOptions.minimumGroundTimeOffset),
      'MGT_OFFSET_IS_VALID',
      'Minimum ground time offset is invalid.'
    );
    return validation;
  }

  static addOrEditDummyAircraftRegisterValidate(
    dummyAircraftRegister: any,
    existingDummyAircraftRegisters?: ReadonlyArray<Readonly<DummyAircraftRegisterModel>>
  ): Validation<
    | 'NAME_REQUIRED'
    | 'NAME_IS_VALID'
    | 'NAME_IS_UNIQUE_BETWEEN_DUMMY_AIRCRAFT_REGISTERS'
    | 'NAME_IS_UNIQUE_BETWEEN_AIRCRAFT_REGISTERS'
    | 'NAME_IS_UNIQUE_BETWEEN_AIRCRAFT_TYPES'
    | 'NAME_IS_UNIQUE_BETWEEN_AIRCRAFT_GROUPS'
    | 'AIRCRAFT_TYPE_ID_REQUIRED'
    | 'AIRCRAFT_TYPE_ID_IS_VALID'
  > {
    const validation = new Validation();
    validation.check('data exsits', [], () => dummyAircraftRegister);
    validation.check('name exists', ['data exists'], () => dummyAircraftRegister.name, 'NAME_REQUIRED', 'Name is required.');
    validation.check(
      'name is valid',
      ['name exists'],
      () => typeof dummyAircraftRegister.name === 'string' && /^[A-Z0-9_+-]{3}$/.test(dummyAircraftRegister.name),
      'NAME_IS_VALID',
      'Name is invalid.'
    );
    validation.check(
      'name is unique between dummy aircraft registers',
      ['name is valid'],
      () => !existingDummyAircraftRegisters || !existingDummyAircraftRegisters.some(a => a.name.toUpperCase() === dummyAircraftRegister.name.toUpperCase()),
      'NAME_IS_UNIQUE_BETWEEN_DUMMY_AIRCRAFT_REGISTERS',
      'Name already exists among other dummy aircraft registers.'
    );
    validation.check(
      'name is unique between aircraft registers',
      ['name is valid'],
      () => !MasterData.all.aircraftRegisters.items.some(a => a.name.toUpperCase() === dummyAircraftRegister.name.toUpperCase()),
      'NAME_IS_UNIQUE_BETWEEN_AIRCRAFT_REGISTERS',
      'Name already exists among aircraft registers.'
    );
    validation.check(
      'name is unique between aircraft types',
      ['name is valid'],
      () => !MasterData.all.aircraftTypes.items.some(t => t.name.toUpperCase() === dummyAircraftRegister.name.toUpperCase()),
      'NAME_IS_UNIQUE_BETWEEN_AIRCRAFT_TYPES',
      'Name already exists among aircraft types'
    );
    validation.check(
      'name is unique between aircraft groups',
      ['name is valid'],
      () => !MasterData.all.aircraftGroups.items.some(g => g.name.toUpperCase() === dummyAircraftRegister.name.toUpperCase()),
      'NAME_IS_UNIQUE_BETWEEN_AIRCRAFT_GROUPS',
      'Name already exists among aircraft groups.'
    );
    validation.check('aircraft type exists', ['data exists'], () => dummyAircraftRegister.aircraftTypeId, 'AIRCRAFT_TYPE_ID_REQUIRED', 'Aircraft type is required.');
    validation.check(
      'aircraft type is valid',
      ['aircraft type exists'],
      () => MasterData.all.aircraftTypes.items.some(t => t.id === dummyAircraftRegister.aircraftTypeId),
      'AIRCRAFT_TYPE_ID_IS_VALID',
      'Aircraft type is invalid.'
    );
    return validation;
  }
}
