import AircraftRegisterOptionsStatus from '@core/types/AircraftRegisterOptionsStatus';
import MasterData, { AircraftType } from '@core/master-data';
import Validation from '@core/node_modules/@ahs502/validation/dist/Validation';
import { dataTypes } from 'src/utils/DataType';
import Flight from 'src/business/flight/Flight';

export type ViewState = AircraftRegistersPerTypeViewState[];
export class ViewStateValidation extends Validation<
  string,
  {
    aircraftRegistersPerTypeViewStateValidations: {
      [typeId: string]: AircraftRegistersPerTypeViewStateValidation;
    };
  }
> {
  constructor(viewState: ViewState, flights: readonly Flight[]) {
    super(validator => {
      validator
        .array(viewState)
        .each(aircraftRegistersPerTypeViewState =>
          validator.put(
            validator.$.aircraftRegistersPerTypeViewStateValidations[aircraftRegistersPerTypeViewState.type.id],
            new AircraftRegistersPerTypeViewStateValidation(aircraftRegistersPerTypeViewState, viewState, flights)
          )
        );
    });
  }
}

export interface AircraftRegistersPerTypeViewState {
  type: AircraftType;
  registers: AircraftRegisterViewState[];
  dummyRegisters: DummyAircraftRegisterViewState[];
}
class AircraftRegistersPerTypeViewStateValidation extends Validation<
  string,
  {
    registerValidations: {
      [registerId: string]: AircraftRegisterViewStateValidation;
    };
    dummyRegisterValidations: {
      [dummyRegisterId: string]: DummyAircraftRegisterViewStateValidation;
    };
  }
> {
  constructor({ registers, dummyRegisters }: AircraftRegistersPerTypeViewState, viewState: ViewState, flights: readonly Flight[]) {
    super(validator => {
      validator.array(registers).each(register => validator.put(validator.$.registerValidations[register.id], new AircraftRegisterViewStateValidation(register, flights)));
      validator
        .array(dummyRegisters)
        .each(dummyRegister =>
          validator.put(validator.$.dummyRegisterValidations[dummyRegister.id], new DummyAircraftRegisterViewStateValidation(dummyRegister, viewState, flights))
        );
    });
  }
}

export interface AircraftRegisterViewState {
  id: string;
  name: string;
  groups: string[];
  baseAirport: string;
  status: AircraftRegisterOptionsStatus;
}
export class AircraftRegisterViewStateValidation extends Validation<
  'BASE_AIRPORT_EXISTS' | 'BASE_AIRPORT_FORMAT_IS_CORRECT' | 'STATUS_IS_NOT_IGNORED_OR_AIRCRAFT_REGISTER_IS_NOT_USED'
> {
  constructor({ id, baseAirport, status }: AircraftRegisterViewState, flights: readonly Flight[]) {
    super(validator => {
      validator
        .if(status === 'INCLUDED' || status === 'BACKUP' || !!baseAirport)
        .check('BASE_AIRPORT_EXISTS', !!baseAirport)
        .check('BASE_AIRPORT_FORMAT_IS_CORRECT', dataTypes.airport.checkView(baseAirport), 'Invalid.');
      validator
        .if(status === 'IGNORED')
        .check(
          'STATUS_IS_NOT_IGNORED_OR_AIRCRAFT_REGISTER_IS_NOT_USED',
          () => flights.every(f => !f.aircraftRegister || f.aircraftRegister.dummy || f.aircraftRegister.id !== id),
          'Aircraft is being used.'
        );
    });
  }
}

export interface DummyAircraftRegisterViewState {
  id: string;
  name: string;
  baseAirport: string;
  status: AircraftRegisterOptionsStatus;
}
export class DummyAircraftRegisterViewStateValidation extends Validation<
  | 'NAME_EXISTS'
  | 'NAME_FORMAT_IS_CORRECT'
  | 'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_TYPES'
  | 'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_GROUPS'
  | 'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_REGISTERS'
  | 'NAME_HAS_AT_LEAST_3_CHARACTERS'
  | 'NAME_HAS_AT_MOST_10_CHARACTERS'
  | 'BASE_AIRPORT_EXISTS'
  | 'BASE_AIRPORT_FORMAT_IS_CORRECT'
  | 'STATUS_IS_NOT_IGNORED_OR_AIRCRAFT_REGISTER_IS_NOT_USED'
> {
  constructor({ id, name, baseAirport, status }: DummyAircraftRegisterViewState, viewState: ViewState, flights: readonly Flight[]) {
    super(validator => {
      const dummyAircraftRegisterNames = viewState.flatMap(t => t.dummyRegisters.flatMap(r => r.name.toUpperCase()));
      validator
        .check('NAME_EXISTS', !!name)
        .check('NAME_FORMAT_IS_CORRECT', () => dataTypes.label.checkView(name), 'Invalid.')
        .then(() => dataTypes.label.refineView(name))
        .check(
          'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_TYPES',
          name => !MasterData.all.aircraftTypes.items.some(t => name === t.name || name === `${t.name}_DUMMY` || name === `${t.name}_EXISTS`),
          name => `Dupplicated with aircraft type ${name}`
        )
        .check(
          'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_GROUPS',
          name => !(name in MasterData.all.aircraftRegisterGroups.name),
          name => `Dupplicated with aircraft group ${name}`
        )
        .check(
          'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_REGISTERS',
          name => !(name in MasterData.all.aircraftRegisters.name || dummyAircraftRegisterNames.filter(n => n === name).length > 1),
          name => `Dupplicated with aircraft register ${name}`
        )
        .check('NAME_HAS_AT_LEAST_3_CHARACTERS', name => name.length >= 3, 'At least 3 characters.')
        .check('NAME_HAS_AT_MOST_10_CHARACTERS', name => name.length <= 10, 'At most 10 characters.');
      validator
        .if(status === 'INCLUDED' || status === 'BACKUP' || !!baseAirport)
        .check('BASE_AIRPORT_EXISTS', !!baseAirport)
        .check('BASE_AIRPORT_FORMAT_IS_CORRECT', dataTypes.airport.checkView(baseAirport), 'Invalid.');
      validator
        .if(status === 'IGNORED')
        .check(
          'STATUS_IS_NOT_IGNORED_OR_AIRCRAFT_REGISTER_IS_NOT_USED',
          () => flights.every(f => !f.aircraftRegister || !f.aircraftRegister.dummy || f.aircraftRegister.id !== id),
          'Aircraft is being used.'
        );
    });
  }
}

export interface AddDummyAircraftRegisterFormState {
  bypassValidation: boolean;
  show: boolean;
  name: string;
  aircraftType: string;
  baseAirport: string;
  status: AircraftRegisterOptionsStatus;
}
export class AddDummyAircraftRegisterFormStateValidation extends Validation<
  | 'NAME_EXISTS'
  | 'NAME_FORMAT_IS_CORRECT'
  | 'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_TYPES'
  | 'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_GROUPS'
  | 'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_REGISTERS'
  | 'NAME_HAS_AT_LEAST_3_CHARACTERS'
  | 'NAME_HAS_AT_MOST_10_CHARACTERS'
  | 'AIRCRAFT_TYPE_EXISTS'
  | 'AIRCRAFT_TYPE_IS_VALID'
  | 'BASE_AIRPORT_EXISTS'
  | 'BASE_AIRPORT_IS_VALID'
> {
  constructor({ name, aircraftType, baseAirport, status }: AddDummyAircraftRegisterFormState, viewState: ViewState) {
    super(validator => {
      const dummyAircraftRegisterNames = viewState.flatMap(t => t.dummyRegisters.flatMap(r => r.name.toUpperCase()));
      validator
        .check('NAME_EXISTS', !!name)
        .check('NAME_FORMAT_IS_CORRECT', () => dataTypes.label.checkView(name), 'Invalid.')
        .then(() => dataTypes.label.refineView(name))
        .check(
          'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_TYPES',
          name => !MasterData.all.aircraftTypes.items.some(t => name === t.name || name === `${t.name}_DUMMY` || name === `${t.name}_EXISTS`),
          name => `Dupplicated with aircraft type ${name}`
        )
        .check(
          'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_GROUPS',
          name => !(name in MasterData.all.aircraftRegisterGroups.name),
          name => `Dupplicated with aircraft group ${name}`
        )
        .check(
          'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_REGISTERS',
          name => !(name in MasterData.all.aircraftRegisters.name || dummyAircraftRegisterNames.includes(name)),
          name => `Dupplicated with aircraft register ${name}`
        )
        .check('NAME_HAS_AT_LEAST_3_CHARACTERS', name => name.length >= 3, 'At least 3 characters.')
        .check('NAME_HAS_AT_MOST_10_CHARACTERS', name => name.length <= 10, 'At most 10 characters.');
      validator.check('AIRCRAFT_TYPE_EXISTS', !!aircraftType).check('AIRCRAFT_TYPE_IS_VALID', () => dataTypes.aircraftType.checkView(aircraftType));
      validator
        .if(status === 'INCLUDED' || status === 'BACKUP' || !!baseAirport)
        .check('BASE_AIRPORT_EXISTS', !!baseAirport)
        .check('BASE_AIRPORT_IS_VALID', () => dataTypes.airport.checkView(baseAirport));
    });
  }
}
