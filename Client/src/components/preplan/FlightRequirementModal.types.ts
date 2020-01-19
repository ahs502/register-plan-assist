import Id from '@core/types/Id';
import AircraftIdentityType from '@core/types/AircraftIdentityType';
import Rsx from '@core/types/Rsx';
import { Stc } from 'src/business/master-data';
import Weekday from '@core/types/Weekday';
import Validation from '@ahs502/validation';
import { dataTypes } from 'src/utils/DataType';
import { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';

export interface ViewState {
  bypassValidation: boolean;
  label: string;
  addingNewCategory: boolean;
  category: string;
  categoryOption?: GeneralOptionViewState;
  stc: Stc;
  scopeIndex: 'BASE' | number;
  dayIndex: 'ALL' | Weekday;
  legIndex: number;
  sliderStartIndex: number;
  sliderEndIndex: number;
  route: RouteLegViewState[];
  baseScope: BaseScopeViewState;
  changeScopes: ChangeScopeViewState[];
  selectedWeekIndex?: number;
}

export interface RouteLegViewState {
  originalIndex?: number;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
}

export interface BaseScopeViewState {
  baseDay: BaseDayViewState;
  weekDays: WeekDayViewState[];
}
export interface ChangeScopeViewState extends BaseScopeViewState {
  startWeekIndex: number;
  endWeekIndex: number;
  isTemp: boolean;
  isNew: boolean;
}

export interface BaseDayViewState {
  rsx: Rsx;
  notes: string;
  allowedAircraftIdentities: readonly AircraftIdentityOptionViewState[];
  forbiddenAircraftIdentities: readonly AircraftIdentityOptionViewState[];
  aircraftRegister: string;
  legs: LegViewState[];
}
export interface WeekDayViewState extends BaseDayViewState {
  selected: boolean;
}

export interface LegViewState {
  blockTime: string;
  stdLowerBound: string;
  staLowerBound: string;
  stdUpperBound: string;
  staUpperBound: string;
  originPermission: boolean;
  destinationPermission: boolean;
}

export interface GeneralOptionViewState {
  name: string;
}
export interface RsxOptionViewState extends GeneralOptionViewState {
  name: Rsx;
}
export interface AircraftIdentityOptionViewState extends GeneralOptionViewState {
  id: Id;
  type: AircraftIdentityType;
  entityId: Id;
}

const defaultBadgeFailureMessage = {
  '*_EXISTS': 'Required.',
  '*_FORMAT_IS_VALID': 'Invalid format.',
  '*_IS_VALID': 'Invalid.',
  '*_IS_NOT_NEGATIVE': 'Should not be negative.'
};

export class ViewStateValidation extends Validation<
  'LABEL_EXISTS' | 'LABEL_FORMAT_IS_VALID' | 'LABEL_IS_NOT_TOO_LONG' | 'CATEGORY_FORMAT_IS_VALID' | 'CATEGORY_IS_NOT_TOO_LONG',
  {
    routeLegValidations: RouteLegViewStateValidation[];
    baseScopeValidation: ScopeViewStateValidation;
    changeScopeValidations: ScopeViewStateValidation[];
  }
> {
  constructor({ label, category, route, baseScope, changeScopes }: ViewState, aircraftRegisters: PreplanAircraftRegisters) {
    super(validator => {
      validator
        .check('LABEL_EXISTS', !!label)
        .check('LABEL_FORMAT_IS_VALID', () => dataTypes.name.checkView(label), 'Invalid label.')
        .check('LABEL_IS_NOT_TOO_LONG', () => dataTypes.name.refineView(label).length <= 100, 'Less than 100 characters.');
      validator
        .if(!!category)
        .check('CATEGORY_FORMAT_IS_VALID', () => dataTypes.name.checkView(category), 'Invalid category.')
        .check('CATEGORY_IS_NOT_TOO_LONG', dataTypes.name.refineView(category).length <= 100, 'Less than 100 characters.');
      validator
        .array(route)
        .each((routeLeg, index, route) => validator.put(validator.$.routeLegValidations[index], new RouteLegViewStateValidation(routeLeg, route[index - 1], route[index + 1])));
      validator.put(validator.$.baseScopeValidation, new ScopeViewStateValidation(baseScope, aircraftRegisters));
      validator
        .array(changeScopes)
        .each((changeScope, index) => validator.put(validator.$.changeScopeValidations[index], new ScopeViewStateValidation(changeScope, aircraftRegisters)));
    }, defaultBadgeFailureMessage);
  }
}

class RouteLegViewStateValidation extends Validation<
  | 'FLIGHT_NUMBER_EXISTS'
  | 'FLIGHT_NUMBER_FORMAT_IS_VALID'
  | 'DEPARTURE_AIRPORT_EXISTS'
  | 'DEPARTURE_AIRPORT_FORMAT_IS_VALIED'
  | 'DEPARTURE_AIRPORT_MATCHES_PREVIOUS_LEG'
  | 'ARRIVAL_AIRPORT_EXISTS'
  | 'ARRIVAL_AIRPORT_FORMAT_IS_VALIED'
  | 'ARRIVAL_AIRPORT_MATCHES_NEXT_LEG'
> {
  constructor({ flightNumber, departureAirport, arrivalAirport }: RouteLegViewState, previousLeg: RouteLegViewState | undefined, nextLeg: RouteLegViewState | undefined) {
    super(validator => {
      validator
        .check('FLIGHT_NUMBER_EXISTS', !!flightNumber)
        .check('FLIGHT_NUMBER_FORMAT_IS_VALID', () => dataTypes.flightNumber.checkView(flightNumber), 'Invalid flight number.');
      validator
        .check('DEPARTURE_AIRPORT_EXISTS', !!departureAirport)
        .check('DEPARTURE_AIRPORT_FORMAT_IS_VALIED', dataTypes.airport.checkView(departureAirport), 'Invalid airport.')
        .if(!!previousLeg)
        .check(
          'DEPARTURE_AIRPORT_MATCHES_PREVIOUS_LEG',
          () => dataTypes.airport.refineView(departureAirport) === dataTypes.airport.refineView(previousLeg!.arrivalAirport),
          'Must match previous leg.'
        );
      validator
        .check('ARRIVAL_AIRPORT_EXISTS', !!arrivalAirport)
        .check('ARRIVAL_AIRPORT_FORMAT_IS_VALIED', dataTypes.airport.checkView(arrivalAirport), 'Invalid airport.')
        .if(!!nextLeg)
        .check(
          'ARRIVAL_AIRPORT_MATCHES_NEXT_LEG',
          () => dataTypes.airport.refineView(arrivalAirport) === dataTypes.airport.refineView(nextLeg!.departureAirport),
          'Must match next leg.'
        );
    }, defaultBadgeFailureMessage);
  }
}

class ScopeViewStateValidation extends Validation<
  '',
  {
    baseDayValidation: DayViewStateValidation;
    weekDayValidations: DayViewStateValidation[];
  }
> {
  constructor({ baseDay, weekDays }: BaseScopeViewState, aircraftRegisters: PreplanAircraftRegisters) {
    super(validator => {
      validator.put(validator.$.baseDayValidation, new DayViewStateValidation(baseDay, aircraftRegisters));
      validator.array(weekDays).each((weekDay, index) => validator.put(validator.$.weekDayValidations[index], new DayViewStateValidation(weekDay, aircraftRegisters)));
    }, defaultBadgeFailureMessage);
  }
}

class DayViewStateValidation extends Validation<
  'NOTES_FORMAT_IS_VALID' | 'ALLOWED_AIRCRAFT_IDENTITIES_EXISTS' | 'AIRCRAFT_REGISTER_FORMAT_IS_VALID',
  {
    legValidations: LegViewStateValidation[];
  }
> {
  constructor({ notes, allowedAircraftIdentities, aircraftRegister, legs }: BaseDayViewState, aircraftRegisters: PreplanAircraftRegisters) {
    super(validator => {
      validator.if(!!notes).check('NOTES_FORMAT_IS_VALID', () => dataTypes.label.checkView(notes));
      validator.check('ALLOWED_AIRCRAFT_IDENTITIES_EXISTS', allowedAircraftIdentities.length > 0);
      validator
        .if(!!aircraftRegister)
        .check('AIRCRAFT_REGISTER_FORMAT_IS_VALID', () => dataTypes.preplanAircraftRegister(aircraftRegisters).checkView(aircraftRegister), 'Invalid aircraft register.');
      validator.array(legs).each((leg, index) => validator.put(validator.$.legValidations[index], new LegViewStateValidation(leg)));
    }, defaultBadgeFailureMessage);
  }
}

class LegViewStateValidation extends Validation<
  | 'BLOCKTIME_EXISTS'
  | 'BLOCKTIME_FORMAT_IS_CORRECT'
  | 'BLOCKTIME_IS_POSITIVE'
  | 'BLOCKTIME_IS_AT_MOST_16_HOURS'
  | 'STD_LOWER_BOUND_EXISTS'
  | 'STD_LOWER_BOUND_FORMAT_IS_CORRECT'
  | 'STD_LOWER_BOUND_IS_NOT_NEGATIVE'
  | 'STD_UPPER_BOUND_FORMAT_IS_CORRECT'
  | 'STD_UPPER_BOUND_IS_NOT_NEGATIVE'
> {
  constructor({ blockTime, stdLowerBound, stdUpperBound }: LegViewState) {
    super(validator => {
      validator
        .check('BLOCKTIME_EXISTS', !!blockTime)
        .check('BLOCKTIME_FORMAT_IS_CORRECT', () => dataTypes.daytime.checkView(blockTime), 'Invalid time.')
        .then(() => dataTypes.daytime.convertViewToModel(blockTime))
        .check('BLOCKTIME_IS_POSITIVE', blockTime => blockTime > 0, 'Positive time required.')
        .check('BLOCKTIME_IS_AT_MOST_16_HOURS', blockTime => blockTime <= 16 * 60, 'Can not exceed 16 hours.');
      validator
        .check('STD_LOWER_BOUND_EXISTS', !!stdLowerBound)
        .check('STD_LOWER_BOUND_FORMAT_IS_CORRECT', () => dataTypes.daytime.checkView(stdLowerBound), 'Invalid time.')
        .check('STD_LOWER_BOUND_IS_NOT_NEGATIVE', () => dataTypes.daytime.convertViewToModel(stdLowerBound) >= 0, 'Negative time is not allowed.');
      validator
        .if(!!stdUpperBound)
        .check('STD_UPPER_BOUND_FORMAT_IS_CORRECT', () => dataTypes.daytime.checkView(stdUpperBound), 'Invalid time.')
        .check('STD_UPPER_BOUND_IS_NOT_NEGATIVE', () => dataTypes.daytime.convertViewToModel(stdUpperBound) >= 0, 'Negative time is not allowed.');
    }, defaultBadgeFailureMessage);
  }
}
