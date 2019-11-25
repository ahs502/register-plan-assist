import AircraftRegisterOptionsStatus from '@core/types/AircraftRegisterOptionsStatus';
import MasterData, { AircraftType } from '@core/master-data';
import Validation from '@core/node_modules/@ahs502/validation/dist/Validation';
import { formFields } from 'src/utils/FormField';

export type ViewState = AircraftRegistersPerTypeViewState[];
export class ViewStateValidation extends Validation<
  string,
  {
    aircraftRegistersPerTypeViewStateValidations: AircraftRegistersPerTypeViewStateValidation[];
  }
> {
  constructor(viewState: ViewState) {
    super(validator => {
      const dummyAircraftRegisterNames = viewState.flatMap(t => t.dummyRegisters.flatMap(r => r.name.toUpperCase()));
      validator
        .array(viewState)
        .each((aircraftRegistersPerTypeViewState, index) =>
          validator.put(
            validator.$.aircraftRegistersPerTypeViewStateValidations[index],
            new AircraftRegistersPerTypeViewStateValidation(aircraftRegistersPerTypeViewState, dummyAircraftRegisterNames)
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
    registerValidations: AircraftRegisterViewStateValidation[];
    dummyRegisterValidations: DummyAircraftRegisterViewStateValidation[];
  }
> {
  constructor({ registers, dummyRegisters }: AircraftRegistersPerTypeViewState, dummyAircraftRegisterNames: readonly string[]) {
    super(validator => {
      validator.array(registers).each((register, index) => validator.put(validator.$.registerValidations[index], new AircraftRegisterViewStateValidation(register)));
      validator
        .array(dummyRegisters)
        .each((dummyRegister, index) =>
          validator.put(validator.$.dummyRegisterValidations[index], new DummyAircraftRegisterViewStateValidation(dummyRegister, dummyAircraftRegisterNames))
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
class AircraftRegisterViewStateValidation extends Validation<'BASE_AIRPORT_EXISTS' | 'BASE_AIRPORT_FORMAT_IS_CORRECT'> {
  constructor({ baseAirport, status }: AircraftRegisterViewState) {
    super(validator => {
      validator
        .if(status === 'INCLUDED' || status === 'BACKUP' || !!baseAirport)
        .check('BASE_AIRPORT_EXISTS', !!baseAirport)
        .check('BASE_AIRPORT_FORMAT_IS_CORRECT', formFields.airport.check(baseAirport), 'Invalid.');
    });
  }
}

export interface DummyAircraftRegisterViewState {
  id: string;
  name: string;
  baseAirport: string;
  status: AircraftRegisterOptionsStatus;
}
class DummyAircraftRegisterViewStateValidation extends Validation<
  | 'NAME_EXISTS'
  | 'NAME_FORMAT_IS_CORRECT'
  | 'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_TYPES'
  | 'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_GROUPS'
  | 'NAME_IS_NOT_DUPLICATED_WITH_AIRCRAFT_REGISTERS'
  | 'BASE_AIRPORT_EXISTS'
  | 'BASE_AIRPORT_FORMAT_IS_CORRECT'
> {
  constructor({ baseAirport, status }: DummyAircraftRegisterViewState, dummyAircraftRegisterNames: readonly string[]) {
    super(validator => {
      validator
        .check('NAME_EXISTS', !!name)
        .check('NAME_FORMAT_IS_CORRECT', () => formFields.label.check(name), 'Invalid.')
        .then(() => formFields.label.refine(name))
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
        );
      validator
        .if(status === 'INCLUDED' || status === 'BACKUP' || !!baseAirport)
        .check('BASE_AIRPORT_EXISTS', !!baseAirport)
        .check('BASE_AIRPORT_FORMAT_IS_CORRECT', formFields.airport.check(baseAirport), 'Invalid.');
    });
  }
}

export interface AddDummyAircraftRegisterFormState {
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
  | 'AIRCRAFT_TYPE_EXISTS'
  | 'AIRCRAFT_TYPE_IS_VALID'
  | 'BASE_AIRPORT_EXISTS'
  | 'BASE_AIRPORT_IS_VALID'
> {
  constructor({ name, aircraftType, baseAirport }: AddDummyAircraftRegisterFormState, viewState: ViewState) {
    super(validator => {
      const dummyAircraftRegisterNames = viewState.flatMap(t => t.dummyRegisters.flatMap(r => r.name.toUpperCase()));
      validator
        .check('NAME_EXISTS', !!name)
        .check('NAME_FORMAT_IS_CORRECT', () => formFields.label.check(name), 'Invalid.')
        .then(() => formFields.label.refine(name))
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
        );
      validator.check('AIRCRAFT_TYPE_EXISTS', !!aircraftType).check('AIRCRAFT_TYPE_IS_VALID', () => formFields.aircraftType.check(aircraftType));
      validator
        .if(status === 'INCLUDED' || status === 'BACKUP' || !!baseAirport)
        .check('BASE_AIRPORT_EXISTS', !!baseAirport)
        .check('BASE_AIRPORT_IS_VALID', () => formFields.airport.check(baseAirport));
    });
  }
}
