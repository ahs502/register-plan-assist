import Id from '@core/types/Id';
import AircraftIdentityType from '@core/types/AircraftIdentityType';
import Rsx from '@core/types/Rsx';
import { Stc } from '@core/master-data';
import Weekday from '@core/types/Weekday';
import Validation from '@ahs502/validation';
import { formFields } from 'src/utils/FormField';

export interface ViewState {
  label: string;
  category: string;
  stc: Stc;
  tabIndex: 'ALL' | Weekday;
  legIndex: number;
  default: TabViewState;
  route: RouteLegViewState[];
  days: DayTabViewState[];
}
export class ViewStateValidation extends Validation<
  'LABEL_EXISTS' | 'LABEL_FORMAT_IS_VALID' | 'CATEGORY_FORMAT_IS_VALID',
  {
    defaultValidation: TabViewStateValidation;
    routeValidation: RouteLegViewStateValidation[];
    dayValidations: TabViewStateValidation[];
  }
> {
  constructor({ label, category, default: defaultTab, route, days }: ViewState) {
    super(validator => {
      validator.check('LABEL_EXISTS', !!label).check('LABEL_FORMAT_IS_VALID', () => formFields.name.check(label), 'Invalid label.');
      validator.if(!!category).check('CATEGORY_FORMAT_IS_VALID', () => formFields.name.check(category), 'Invalid category.');
      validator.put(validator.$.defaultValidation, new TabViewStateValidation(defaultTab));
      validator
        .array(route)
        .each((routeLeg, index, route) => validator.put(validator.$.routeValidation[index], new RouteLegViewStateValidation(routeLeg, route[index - 1], route[index + 1])));
      validator.array(days).each((day, index) => validator.put(validator.$.dayValidations[index], new TabViewStateValidation(day)));
    });
  }
}

export interface TabViewState {
  rsx: Rsx;
  notes: string;
  allowedAircraftIdentities: readonly AircraftIdentityOptionViewState[];
  forbiddenAircraftIdentities: readonly AircraftIdentityOptionViewState[];
  legs: LegViewState[];
}
class TabViewStateValidation extends Validation<
  'NOTE_FORMAT_IS_VALID' | 'ALLOWED_AIRCRAFT_IDENTITIES_EXISTS',
  {
    legValidations: LegViewStateValidation[];
  }
> {
  constructor({ notes, allowedAircraftIdentities, legs }: TabViewState) {
    super(validator => {
      validator.if(!!notes).check('NOTE_FORMAT_IS_VALID', () => formFields.name.check(notes));
      validator.check('ALLOWED_AIRCRAFT_IDENTITIES_EXISTS', allowedAircraftIdentities.length > 0);
      validator.array(legs).each((leg, index) => validator.put(validator.$.legValidations[index], new LegViewStateValidation(leg)));
    });
  }
}

export interface DayTabViewState extends TabViewState {
  selected: boolean;
}

export interface RouteLegViewState {
  originalIndex?: number;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
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
      validator.check('FLIGHT_NUMBER_EXISTS', !!flightNumber).check('FLIGHT_NUMBER_FORMAT_IS_VALID', () => formFields.flightNumber.check(flightNumber), 'Invalid flight number.');
      validator
        .check('DEPARTURE_AIRPORT_EXISTS', !!departureAirport)
        .check('DEPARTURE_AIRPORT_FORMAT_IS_VALIED', formFields.airport.check(departureAirport), 'Invalid airport.')
        .if(!!previousLeg)
        .check(
          'DEPARTURE_AIRPORT_MATCHES_PREVIOUS_LEG',
          () => formFields.airport.refine(departureAirport) === formFields.airport.refine(previousLeg!.arrivalAirport),
          'Must match previous leg.'
        );
      validator
        .check('ARRIVAL_AIRPORT_EXISTS', !!arrivalAirport)
        .check('ARRIVAL_AIRPORT_FORMAT_IS_VALIED', formFields.airport.check(arrivalAirport), 'Invalid airport.')
        .if(!!nextLeg)
        .check(
          'ARRIVAL_AIRPORT_MATCHES_NEXT_LEG',
          () => formFields.airport.refine(arrivalAirport) === formFields.airport.refine(nextLeg!.departureAirport),
          'Must match next leg.'
        );
    });
  }
}

export interface LegViewState {
  blockTime: string;
  stdLowerBound: string;
  stdUpperBound: string;
  originPermission: boolean;
  destinationPermission: boolean;
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
        .check('BLOCKTIME_FORMAT_IS_CORRECT', () => formFields.daytime.check(blockTime), 'Invalid time.')
        .then(() => formFields.daytime.parse(blockTime))
        .check('BLOCKTIME_IS_POSITIVE', blockTime => blockTime > 0, 'Positive time required.')
        .check('BLOCKTIME_IS_AT_MOST_16_HOURS', blockTime => blockTime <= 16 * 60, 'Can not exceed 16 hours.');
      validator
        .check('STD_LOWER_BOUND_EXISTS', !!stdLowerBound)
        .check('STD_LOWER_BOUND_FORMAT_IS_CORRECT', () => formFields.daytime.check(stdLowerBound), 'Invalid time.')
        .check('STD_LOWER_BOUND_IS_NOT_NEGATIVE', () => formFields.daytime.parse(stdLowerBound) >= 0, 'Negative time is not allowed.');
      validator
        .if(!!stdUpperBound)
        .check('STD_UPPER_BOUND_FORMAT_IS_CORRECT', () => formFields.daytime.check(stdUpperBound), 'Invalid time.')
        .check('STD_UPPER_BOUND_IS_NOT_NEGATIVE', () => formFields.daytime.parse(stdUpperBound) >= 0, 'Negative time is not allowed.');
    });
  }
}

export interface AircraftIdentityOptionViewState {
  id: Id;
  name: string;
  type: AircraftIdentityType;
  entityId: Id;
}
