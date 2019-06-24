import Validation from './Validation';
import MasterData from '../master-data';
import DummyAircraftRegisterModel from '../models/DummyAircraftRegisterModel';
import { type } from 'os';
import { AircraftIdentityType } from '../types/AircraftIdentity';

export default class PreplanValidator {
  static createEmptyValidate(name: any, startDate: any, endDate: any) {
    const validation = new Validation<'NAME_EXISTS' | 'START_DATE_EXISTS' | 'START_DATE_IS_VALID' | 'END_DATE_EXISTS' | 'END_DATE_IS_VALID' | 'START_DATE_BEFORE_END_DATE'>();
    validation.check('NAME_EXISTS', name, 'Required.');
    validation.check('START_DATE_EXISTS', startDate, 'Required.').check('START_DATE_IS_VALID', () => new Date(startDate).isValid(), 'Invalid.');
    validation.check('END_DATE_EXISTS', endDate, 'Required.').check('END_DATE_IS_VALID', () => new Date(endDate).isValid(), 'Invalid.');
    validation
      .when('START_DATE_IS_VALID', 'END_DATE_IS_VALID')
      .check('START_DATE_BEFORE_END_DATE', () => new Date(startDate).getDatePart() <= new Date(endDate).getDatePart(), 'Start date must not be after end date.');
    return validation;
  }

  static cloneValidate = PreplanValidator.createEmptyValidate;

  static editHeaderValidate = PreplanValidator.createEmptyValidate;

  static updateAutoArrangerOptionsValidate(autoArrangerOptions: any) {
    const validation = new Validation<'MGT_MODE_EXISTS' | 'MGT_MODE_IS_VALID' | 'MGT_OFFSET_IS_VALID'>();
    validation.if(autoArrangerOptions && typeof autoArrangerOptions === 'object').do(() => {
      const { minimumGroundTimeMode, minimumGroundTimeOffset } = autoArrangerOptions;
      validation
        .check('MGT_MODE_EXISTS', minimumGroundTimeMode, 'Required.')
        .check('MGT_MODE_EXISTS', () => ['MINIMUM', 'MAXIMUM', 'AVERAGE'].includes(minimumGroundTimeMode), 'Invalid.');
      validation.check('MGT_OFFSET_IS_VALID', typeof minimumGroundTimeOffset === 'number' && !isNaN(minimumGroundTimeOffset), 'Invalid.');
    });
    return validation;
  }

  // static addOrEditDummyAircraftRegisterValidate(
  //   dummyAircraftRegister: any,
  //   existingDummyAircraftRegisters?: ReadonlyArray<Readonly<DummyAircraftRegisterModel>>
  // ): Validation<
  //   | 'NAME_REQUIRED'
  //   | 'NAME_IS_VALID'
  //   | 'NAME_IS_UNIQUE_BETWEEN_DUMMY_AIRCRAFT_REGISTERS'
  //   | 'NAME_IS_UNIQUE_BETWEEN_AIRCRAFT_REGISTERS'
  //   | 'NAME_IS_UNIQUE_BETWEEN_AIRCRAFT_TYPES'
  //   | 'NAME_IS_UNIQUE_BETWEEN_AIRCRAFT_GROUPS'
  //   | 'AIRCRAFT_TYPE_ID_REQUIRED'
  //   | 'AIRCRAFT_TYPE_ID_IS_VALID'
  // > {
  //   const validation = new Validation();
  //   validation.check('data exsits', [], () => dummyAircraftRegister);
  //   validation.check('name exists', ['data exists'], () => dummyAircraftRegister.name, 'NAME_REQUIRED', 'Name is required.');
  //   validation.check(
  //     'name is valid',
  //     ['name exists'],
  //     () => typeof dummyAircraftRegister.name === 'string' && /^[A-Z0-9_+-]{3}$/.test(dummyAircraftRegister.name),
  //     'NAME_IS_VALID',
  //     'Name is invalid.'
  //   );
  //   validation.check(
  //     'name is unique between dummy aircraft registers',
  //     ['name is valid'],
  //     () => !existingDummyAircraftRegisters || !existingDummyAircraftRegisters.some(a => a.name.toUpperCase() === dummyAircraftRegister.name.toUpperCase()),
  //     'NAME_IS_UNIQUE_BETWEEN_DUMMY_AIRCRAFT_REGISTERS',
  //     'Name already exists among other dummy aircraft registers.'
  //   );
  //   validation.check(
  //     'name is unique between aircraft registers',
  //     ['name is valid'],
  //     () => !MasterData.all.aircraftRegisters.items.some(a => a.name.toUpperCase() === dummyAircraftRegister.name.toUpperCase()),
  //     'NAME_IS_UNIQUE_BETWEEN_AIRCRAFT_REGISTERS',
  //     'Name already exists among aircraft registers.'
  //   );
  //   validation.check(
  //     'name is unique between aircraft types',
  //     ['name is valid'],
  //     () => !MasterData.all.aircraftTypes.items.some(t => t.name.toUpperCase() === dummyAircraftRegister.name.toUpperCase()),
  //     'NAME_IS_UNIQUE_BETWEEN_AIRCRAFT_TYPES',
  //     'Name already exists among aircraft types'
  //   );
  //   validation.check(
  //     'name is unique between aircraft groups',
  //     ['name is valid'],
  //     () => !MasterData.all.aircraftGroups.items.some(g => g.name.toUpperCase() === dummyAircraftRegister.name.toUpperCase()),
  //     'NAME_IS_UNIQUE_BETWEEN_AIRCRAFT_GROUPS',
  //     'Name already exists among aircraft groups.'
  //   );
  //   validation.check('aircraft type exists', ['data exists'], () => dummyAircraftRegister.aircraftTypeId, 'AIRCRAFT_TYPE_ID_REQUIRED', 'Aircraft type is required.');
  //   validation.check(
  //     'aircraft type is valid',
  //     ['aircraft type exists'],
  //     () => MasterData.all.aircraftTypes.items.some(t => t.id === dummyAircraftRegister.aircraftTypeId),
  //     'AIRCRAFT_TYPE_ID_IS_VALID',
  //     'Aircraft type is invalid.'
  //   );
  //   return validation;
  // }

  // static addOrEditFlightRequirementValidate(flightRequirement: any, dummyAircraftRegisters: readonly DummyAircraftRegisterModel[]) {
  //   const validation = new Validation<
  //     | 'LABEL_EXISTS'
  //     | 'FLIGHT_NUMBER_EXISTS'
  //     | 'FLIGHT_NUMBER_IS_VALID'
  //     | 'DEPARTURE_AIRPORT_EXISTS'
  //     | 'DEPARTURE_AIRPORT_IS_VALID'
  //     | 'ARRIVAL_AIRPORT_EXISTS'
  //     | 'ARRIVAL_AIRPORT_IS_VALID'
  //     | 'BLOCK_TIME_EXISTS'
  //     | 'BLOCK_TIME_IS_VALID'
  //     | 'BLOCK_TIME_IS_POSITIVE'
  //     | 'BLOCK_TIME_IS_NOT_TOO_LONG'
  //     | 'TIMES_STD_LOWER_BOUND_EXISTS'
  //     | 'TIMES_STD_LOWER_BOUND_IS_VALID'
  //     | 'TIMES_STD_LOWER_BOUND_IS_NOT_NEGATIVE'
  //     | 'TIMES_STD_UPPER_BOUND_EXISTS'
  //     | 'TIMES_STD_UPPER_BOUND_IS_VALID'
  //     | 'TIMES_STD_UPPER_BOUND_IS_NOT_NEGATIVE'
  //     | 'TIMES_STD_LOWER_BOUND_BEFORE_STD_UPPER_BOUND'
  //     | 'ALLOWED_IDENTITIES_TYPE_EXISTS'
  //     | 'ALLOWED_IDENTITIES_TYPE_IS_VALID'
  //     | 'ALLOWED_IDENTITIES_NAME_EXISTS'
  //     | 'ALLOWED_IDENTITIES_NAME_IS_VALID'
  //     | 'ALLOWED_IDENTITIES_ENTITY_ID_EXISTS'
  //     | 'ALLOWED_IDENTITIES_ENTITY_ID_IS_VALID'
  //     | 'FORBIDDEN_IDENTITIES_TYPE_EXISTS'
  //     | 'FORBIDDEN_IDENTITIES_TYPE_IS_VALID'
  //     | 'FORBIDDEN_IDENTITIES_NAME_EXISTS'
  //     | 'FORBIDDEN_IDENTITIES_NAME_IS_VALID'
  //     | 'FORBIDDEN_IDENTITIES_ENTITY_ID_EXISTS'
  //     | 'FORBIDDEN_IDENTITIES_ENTITY_ID_IS_VALID'
  //     | 'SLOT_IS_VALID'
  //     | 'SLOT_COMMENT_IS_VALID'
  //     | 'REQUIRED_IS_VALID'
  //     | 'WEEKDAY_BLOCK_TIME_EXISTS'
  //     | 'WEEKDAY_BLOCK_TIME_IS_VALID'
  //     | 'WEEKDAY_BLOCK_TIME_IS_POSITIVE'
  //     | 'WEEKDAY_BLOCK_TIME_IS_NOT_TOO_LONG'
  //     | 'WEEKDAY_TIMES_STD_LOWER_BOUND_EXISTS'
  //     | 'WEEKDAY_TIMES_STD_LOWER_BOUND_IS_VALID'
  //     | 'WEEKDAY_TIMES_STD_LOWER_BOUND_IS_NOT_NEGATIVE'
  //     | 'WEEKDAY_TIMES_STD_UPPER_BOUND_EXISTS'
  //     | 'WEEKDAY_TIMES_STD_UPPER_BOUND_IS_VALID'
  //     | 'WEEKDAY_TIMES_STD_UPPER_BOUND_IS_NOT_NEGATIVE'
  //     | 'WEEKDAY_TIMES_STD_LOWER_BOUND_BEFORE_STD_UPPER_BOUND'
  //     | 'WEEKDAY_ALLOWED_IDENTITIES_TYPE_EXISTS'
  //     | 'WEEKDAY_ALLOWED_IDENTITIES_TYPE_IS_VALID'
  //     | 'WEEKDAY_ALLOWED_IDENTITIES_NAME_EXISTS'
  //     | 'WEEKDAY_ALLOWED_IDENTITIES_NAME_IS_VALID'
  //     | 'WEEKDAY_ALLOWED_IDENTITIES_ENTITY_ID_EXISTS'
  //     | 'WEEKDAY_ALLOWED_IDENTITIES_ENTITY_ID_IS_VALID'
  //     | 'WEEKDAY_FORBIDDEN_IDENTITIES_TYPE_EXISTS'
  //     | 'WEEKDAY_FORBIDDEN_IDENTITIES_TYPE_IS_VALID'
  //     | 'WEEKDAY_FORBIDDEN_IDENTITIES_NAME_EXISTS'
  //     | 'WEEKDAY_FORBIDDEN_IDENTITIES_NAME_IS_VALID'
  //     | 'WEEKDAY_FORBIDDEN_IDENTITIES_ENTITY_ID_EXISTS'
  //     | 'WEEKDAY_FORBIDDEN_IDENTITIES_ENTITY_ID_IS_VALID'
  //     | 'WEEKDAY_SLOT_IS_VALID'
  //     | 'WEEKDAY_SLOT_COMMENT_IS_VALID'
  //     | 'WEEKDAY_REQUIRED_IS_VALID'
  //     |'NOTES_IS_VALID'
  //     | 'IGNORED_IS_VALID'
  //   >();
  //   validation.if(flightRequirement && typeof flightRequirement === 'object').do(() => {
  //     const { definition, scope, days, ignored } = flightRequirement;
  //     validation.if(definition && typeof definition === 'object').do(() => {
  //       const { label, flightNumber, departureAirportId, arrivalAirportId } = definition;
  //       validation.check('LABEL_EXISTS', label && typeof label === 'string', 'Required.');
  //       validation
  //         .check('FLIGHT_NUMBER_EXISTS', flightNumber && typeof flightNumber === 'string', 'Required.')
  //         .check('FLIGHT_NUMBER_IS_VALID', () => /^([A-Z]{1}\d{1}\s|\d{1}[A-Z]{1}\s|[A-Z]{2}\s|[A-Z]{3})\d{4}[A-Z]?$/.test(flightNumber), 'Invalid.');
  //       validation
  //         .check('DEPARTURE_AIRPORT_EXISTS', departureAirportId, 'Required.')
  //         .check('DEPARTURE_AIRPORT_IS_VALID', () => !!MasterData.all.airports.id[departureAirportId], 'Invalid.');
  //       validation.check('ARRIVAL_AIRPORT_EXISTS', departureAirportId, 'Required.');
  //       validation.check('ARRIVAL_AIRPORT_IS_VALID', !!MasterData.all.airports.id[arrivalAirportId], 'Invalid.');
  //     });
  //     validation.if(scope && typeof scope === 'object').do(() => {
  //       const { blockTime, times, aircraftSelection, slot, slotComment, required } = scope;
  //       validation
  //         .check('BLOCK_TIME_EXISTS', blockTime || blockTime === 0 || isNaN(blockTime), 'Required.')
  //         .check('BLOCK_TIME_IS_VALID', () => typeof blockTime === 'number' && !isNaN(blockTime), 'Invalid.')
  //         .check('BLOCK_TIME_IS_POSITIVE', () => blockTime > 0, 'Should be grater then 0.')
  //         .check('BLOCK_TIME_IS_NOT_TOO_LONG', () => blockTime <= 16 * 60, 'Can not exceed 16 hours.');
  //       validation.if(times && Array.isArray(times)).do(() => {
  //         times.forEach((time, index) => {
  //           validation.if(time && typeof time === 'object').do(() => {
  //             const { stdLowerBound, stdUpperBound } = time;
  //             validation
  //               .check('TIMES_STD_LOWER_BOUND_EXISTS', stdLowerBound || stdLowerBound === 0 || isNaN(stdLowerBound), 'Required.', index)
  //               .check('TIMES_STD_LOWER_BOUND_IS_VALID', () => !isNaN(stdLowerBound), 'Invalid.', index)
  //               .check('TIMES_STD_LOWER_BOUND_IS_NOT_NEGATIVE', () => stdLowerBound >= 0, 'Should be greater than 0.', index);
  //             validation
  //               .check('TIMES_STD_UPPER_BOUND_EXISTS', stdUpperBound || stdUpperBound === 0 || isNaN(stdUpperBound), 'Required.', index)
  //               .check('TIMES_STD_UPPER_BOUND_IS_VALID', () => !isNaN(stdUpperBound), 'Invalid.', index)
  //               .check('TIMES_STD_UPPER_BOUND_IS_NOT_NEGATIVE', () => stdUpperBound >= 0, 'Should be greater than 0.', index);
  //             validation
  //               .when({ badge: 'TIMES_STD_LOWER_BOUND_IS_NOT_NEGATIVE', index }, { badge: 'TIMES_STD_UPPER_BOUND_IS_NOT_NEGATIVE', index })
  //               .check('TIMES_STD_LOWER_BOUND_BEFORE_STD_UPPER_BOUND', () => stdLowerBound <= stdUpperBound, 'Lower bound can not exceed upper bound.', index);
  //           });
  //         });
  //       });
  //       validation.if(aircraftSelection && typeof aircraftSelection === 'object').do(() => {
  //         const { allowedIdentities, forbiddenIdentitied } = aircraftSelection;
  //         validation.if(allowedIdentities && Array.isArray(allowedIdentities)).do(() => {
  //           allowedIdentities.forEach((identity, index) => {
  //             validation.if(identity && typeof identity === 'object').do(() => {
  //               const { type, name, entityId } = identity;
  //               validation
  //                 .check('ALLOWED_IDENTITIES_TYPE_EXISTS', type, 'Required.', index)
  //                 .check('ALLOWED_IDENTITIES_TYPE_IS_VALID', () => ['REGISTER', 'TYPE', 'TYPE_EXISTING', 'TYPE_DUMMY', 'GROUP'].includes(type), 'Invalid.', index);
  //               validation
  //                 .check('ALLOWED_IDENTITIES_NAME_EXISTS', name, 'Required.', index)
  //                 .check('ALLOWED_IDENTITIES_NAME_IS_VALID', () => /^[A-Z0-9_+-]+$/.test(name), 'Only letters, digits, _, + and - characters.', index);
  //               validation
  //                 .check('ALLOWED_IDENTITIES_ENTITY_ID_EXISTS', entityId, 'Required.', index)
  //                 .check('ALLOWED_IDENTITIES_ENTITY_ID_IS_VALID', () => checkAircraftIdentityEntityIdValidity(type, entityId), 'Invalid.', index);
  //             });
  //           });
  //         });
  //         validation.if(forbiddenIdentitied && Array.isArray(forbiddenIdentitied)).do(() => {
  //           forbiddenIdentitied.forEach((identity, index) => {
  //             validation.if(identity && typeof identity === 'object').do(() => {
  //               const { type, name, entityId } = identity;
  //               validation
  //                 .check('FORBIDDEN_IDENTITIES_TYPE_EXISTS', type, 'Required.', index)
  //                 .check('FORBIDDEN_IDENTITIES_TYPE_IS_VALID', () => ['REGISTER', 'TYPE', 'TYPE_EXISTING', 'TYPE_DUMMY', 'GROUP'].includes(type), 'Invalid.', index);
  //               validation
  //                 .check('FORBIDDEN_IDENTITIES_NAME_EXISTS', name, 'Required.', index)
  //                 .check('FORBIDDEN_IDENTITIES_NAME_IS_VALID', () => /^[A-Z0-9_+-]+$/.test(name), 'Only letters, digits, _, + and - characters.', index);
  //               validation
  //                 .check('FORBIDDEN_IDENTITIES_ENTITY_ID_EXISTS', entityId, 'Required.', index)
  //                 .check('FORBIDDEN_IDENTITIES_ENTITY_ID_IS_VALID', () => checkAircraftIdentityEntityIdValidity(type, entityId), 'Invalid.', index);
  //             });
  //           });
  //         });
  //       });
  //       validation.check('SLOT_IS_VALID', typeof slot === 'boolean', 'Invalid.');
  //       validation.check('SLOT_COMMENT_IS_VALID', typeof slotComment === 'string', 'Invalid.');
  //       validation.check('REQUIRED_IS_VALID', typeof required === 'boolean', 'Invalid.');
  //     });
  //     validation.if(days && Array.isArray(days)).do(() => {
  //*       days.forEach((weekdayFlightRequirement, index) => {
  //         validation.if(weekdayFlightRequirement && typeof weekdayFlightRequirement === 'object').do(() => {
  //           const { scope, notes, day, flight } = weekdayFlightRequirement;
  //           validation.if(scope && typeof scope === 'object').do(() => {
  //             const { blockTime, times, aircraftSelection, slot, slotComment, required } = scope;
  //             validation
  //               .check('WEEKDAY_BLOCK_TIME_EXISTS', blockTime || blockTime === 0 || isNaN(blockTime), 'Required.', index)
  //               .check('WEEKDAY_BLOCK_TIME_IS_VALID', () => typeof blockTime === 'number' && !isNaN(blockTime), 'Invalid.', index)
  //               .check('WEEKDAY_BLOCK_TIME_IS_POSITIVE', () => blockTime > 0, 'Should be grater then 0.', index)
  //               .check('WEEKDAY_BLOCK_TIME_IS_NOT_TOO_LONG', () => blockTime <= 16 * 60, 'Can not exceed 16 hours.', index);
  //             validation.if(times && Array.isArray(times)).do(() => {
  //*               times.forEach((time, subIndex) => {
  //                 validation.if(time && typeof time === 'object').do(() => {
  //                   const { stdLowerBound, stdUpperBound } = time;
  //                   validation
  //                     .check('WEEKDAY_TIMES_STD_LOWER_BOUND_EXISTS', stdLowerBound || stdLowerBound === 0 || isNaN(stdLowerBound), 'Required.', index,subIndex)
  //                     .check('WEEKDAY_TIMES_STD_LOWER_BOUND_IS_VALID', () => !isNaN(stdLowerBound), 'Invalid.', index,subIndex)
  //                     .check('WEEKDAY_TIMES_STD_LOWER_BOUND_IS_NOT_NEGATIVE', () => stdLowerBound >= 0, 'Should be greater than 0.', index,subIndex);
  //                   validation
  //                     .check('WEEKDAY_TIMES_STD_UPPER_BOUND_EXISTS', stdUpperBound || stdUpperBound === 0 || isNaN(stdUpperBound), 'Required.', index,subIndex)
  //                     .check('WEEKDAY_TIMES_STD_UPPER_BOUND_IS_VALID', () => !isNaN(stdUpperBound), 'Invalid.', index,subIndex)
  //                     .check('WEEKDAY_TIMES_STD_UPPER_BOUND_IS_NOT_NEGATIVE', () => stdUpperBound >= 0, 'Should be greater than 0.', index,subIndex);
  //                   validation
  //                     .when({ badge: 'WEEKDAY_TIMES_STD_LOWER_BOUND_IS_NOT_NEGATIVE', index,subIndex }, { badge: 'WEEKDAY_TIMES_STD_UPPER_BOUND_IS_NOT_NEGATIVE', index ,subIndex})
  //                     .check('WEEKDAY_TIMES_STD_LOWER_BOUND_BEFORE_STD_UPPER_BOUND', () => stdLowerBound <= stdUpperBound, 'Lower bound can not exceed upper bound.', index,subIndex);
  //                 });
  //               });
  //             });
  //             validation.if(aircraftSelection && typeof aircraftSelection === 'object').do(() => {
  //               const { allowedIdentities, forbiddenIdentitied } = aircraftSelection;
  //               validation.if(allowedIdentities && Array.isArray(allowedIdentities)).do(() => {
  //                 allowedIdentities.forEach((identity, subIndex) => {
  //                   validation.if(identity && typeof identity === 'object').do(() => {
  //                     const { type, name, entityId } = identity;
  //                     validation
  //                       .check('WEEKDAY_ALLOWED_IDENTITIES_TYPE_EXISTS', type, 'Required.', index,subIndex)
  //                       .check('WEEKDAY_ALLOWED_IDENTITIES_TYPE_IS_VALID', () => ['REGISTER', 'TYPE', 'TYPE_EXISTING', 'TYPE_DUMMY', 'GROUP'].includes(type), 'Invalid.', index,subIndex);
  //                     validation
  //                       .check('WEEKDAY_ALLOWED_IDENTITIES_NAME_EXISTS', name, 'Required.', index,subIndex)
  //                       .check('WEEKDAY_ALLOWED_IDENTITIES_NAME_IS_VALID', () => /^[A-Z0-9_+-]+$/.test(name), 'Only letters, digits, _, + and - characters.', index,subIndex);
  //                     validation
  //                       .check('WEEKDAY_ALLOWED_IDENTITIES_ENTITY_ID_EXISTS', entityId, 'Required.', index   ,subIndex)
  //                       .check('WEEKDAY_ALLOWED_IDENTITIES_ENTITY_ID_IS_VALID', () => checkAircraftIdentityEntityIdValidity(type, entityId), 'Invalid.', index,subIndex);
  //                   });
  //                 });
  //               });
  //               validation.if(forbiddenIdentitied && Array.isArray(forbiddenIdentitied)).do(() => {
  //                 forbiddenIdentitied.forEach((identity, subIndex) => {
  //                   validation.if(identity && typeof identity === 'object').do(() => {
  //                     const { type, name, entityId } = identity;
  //                     validation
  //                       .check('WEEKDAY_FORBIDDEN_IDENTITIES_TYPE_EXISTS', type, 'Required.', index,subIndex)
  //                       .check('WEEKDAY_FORBIDDEN_IDENTITIES_TYPE_IS_VALID', () => ['REGISTER', 'TYPE', 'TYPE_EXISTING', 'TYPE_DUMMY', 'GROUP'].includes(type), 'Invalid.', index,subIndex);
  //                     validation
  //                       .check('WEEKDAY_FORBIDDEN_IDENTITIES_NAME_EXISTS', name,     'Required.', index,subIndex)
  //                       .check('WEEKDAY_FORBIDDEN_IDENTITIES_NAME_IS_VALID', () => /^[A-Z0-9_+-]+$/.test(name), 'Only letters, digits, _, + and - characters.', index,subIndex);
  //                     validation
  //                       .check('WEEKDAY_FORBIDDEN_IDENTITIES_ENTITY_ID_EXISTS', entityId, 'Required.', index,subIndex)
  //                       .check('WEEKDAY_FORBIDDEN_IDENTITIES_ENTITY_ID_IS_VALID', () => checkAircraftIdentityEntityIdValidity(type, entityId), 'Invalid.', index,subIndex);
  //                   });
  //                 });
  //               });
  //             });
  //             validation.check('WEEKDAY_SLOT_IS_VALID', typeof slot === 'boolean', 'Invalid.', index);
  //             validation.check('WEEKDAY_SLOT_COMMENT_IS_VALID', typeof slotComment === 'string', 'Invalid.', index);
  //             validation.check('WEEKDAY_REQUIRED_IS_VALID', typeof required === 'boolean', 'Invalid.', index);
  //           });
  //           validation.check('NOTES_IS_VALID', typeof notes === 'string', 'Invalid.',index);

  //         });
  //       });
  //     });
  //     validation.check('IGNORED_IS_VALID', typeof ignored === 'boolean', 'Invalid.');
  //   });
  //   return validation;

  //   function checkAircraftIdentityEntityIdValidity(type: AircraftIdentityType, entityId: string): boolean {
  //     switch (type) {
  //       case 'REGISTER':
  //         return !!MasterData.all.aircraftRegisters.id[entityId] || dummyAircraftRegisters.some(r => r.id === entityId);
  //       case 'TYPE':
  //       case 'TYPE_EXISTING':
  //       case 'TYPE_DUMMY':
  //         return !!MasterData.all.aircraftTypes.id[entityId];
  //       case 'GROUP':
  //         return !!MasterData.all.aircraftGroups.id[entityId];
  //       default:
  //         return false;
  //     }
  //   }
  // }
}
