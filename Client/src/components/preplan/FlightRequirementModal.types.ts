import Id from '@core/types/Id';
import AircraftIdentityType from '@core/types/AircraftIdentityType';
import Rsx from '@core/types/Rsx';
import { Stc } from '@core/master-data';
import Weekday from '@core/types/Weekday';
import Validation from '@ahs502/validation';
import { dataTypes } from 'src/utils/DataType';

export interface ViewState {
  bypassValidation: boolean;
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
  'LABEL_EXISTS' | 'LABEL_FORMAT_IS_VALID' | 'LABEL_IS_LESS_THAN_100' | 'CATEGORY_FORMAT_IS_VALID' | 'CATEGORY_IS_LESS_THAN_100',
  {
    defaultValidation: TabViewStateValidation;
    routeValidation: RouteLegViewStateValidation[];
    dayValidations: TabViewStateValidation[];
  }
> {
  constructor({ label, category, default: defaultTab, route, days }: ViewState) {
    super(
      validator => {
        validator
          .check('LABEL_EXISTS', !!label)
          .check('LABEL_FORMAT_IS_VALID', () => dataTypes.name.checkView(label), 'Invalid label.')
          .check('LABEL_IS_LESS_THAN_100', () => dataTypes.name.refineView(label).length <= 100);
        validator
          .if(!!category)
          .check('CATEGORY_FORMAT_IS_VALID', () => dataTypes.name.checkView(category), 'Invalid category.')
          .check('CATEGORY_IS_LESS_THAN_100', dataTypes.name.refineView(category).length <= 100);
        validator.put(validator.$.defaultValidation, new TabViewStateValidation(defaultTab));
        validator
          .array(route)
          .each((routeLeg, index, route) => validator.put(validator.$.routeValidation[index], new RouteLegViewStateValidation(routeLeg, route[index - 1], route[index + 1])));
        validator.array(days).each((day, index) => validator.put(validator.$.dayValidations[index], new TabViewStateValidation(day)));
      },
      {
        '*_EXISTS': 'Required.',
        '*_FORMAT_IS_VALID': 'Invalid format.',
        '*_IS_VALID': 'Invalid.',
        '*_IS_NOT_NEGATIVE': 'Should not be negative.'
      }
    );
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
  'NOTES_FORMAT_IS_VALID' | 'ALLOWED_AIRCRAFT_IDENTITIES_EXISTS',
  {
    legValidations: LegViewStateValidation[];
  }
> {
  constructor({ notes, allowedAircraftIdentities, legs }: TabViewState) {
    super(
      validator => {
        validator.if(!!notes).check('NOTES_FORMAT_IS_VALID', () => dataTypes.name.checkView(notes));
        validator.check('ALLOWED_AIRCRAFT_IDENTITIES_EXISTS', allowedAircraftIdentities.length > 0);
        validator.array(legs).each((leg, index) => validator.put(validator.$.legValidations[index], new LegViewStateValidation(leg)));
      },
      {
        '*_EXISTS': 'Required.',
        '*_FORMAT_IS_VALID': 'Invalid format.',
        '*_IS_VALID': 'Invalid.',
        '*_IS_NOT_NEGATIVE': 'Should not be negative.'
      }
    );
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
    super(
      validator => {
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
      },
      {
        '*_EXISTS': 'Required.',
        '*_FORMAT_IS_VALID': 'Invalid format.',
        '*_IS_VALID': 'Invalid.',
        '*_IS_NOT_NEGATIVE': 'Should not be negative.'
      }
    );
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
    super(
      validator => {
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
      },
      {
        '*_EXISTS': 'Required.',
        '*_FORMAT_IS_VALID': 'Invalid format.',
        '*_IS_VALID': 'Invalid.',
        '*_IS_NOT_NEGATIVE': 'Should not be negative.'
      }
    );
  }
}

export interface AircraftIdentityOptionViewState {
  id: Id;
  name: string;
  type: AircraftIdentityType;
  entityId: Id;
}
