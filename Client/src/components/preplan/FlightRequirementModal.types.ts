import Id from '@core/types/Id';
import AircraftIdentityType from '@core/types/AircraftIdentityType';
import Rsx from '@core/types/Rsx';
import { Stc } from '@core/master-data';
import Weekday from '@core/types/Weekday';
import Validation from '@ahs502/validation';
import { dataTypes } from 'src/utils/DataType';

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
export interface TabViewState {
  rsx: Rsx;
  notes: string;
  allowedAircraftIdentities: readonly AircraftIdentityOptionViewState[];
  forbiddenAircraftIdentities: readonly AircraftIdentityOptionViewState[];
  legs: LegViewState[];
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
// export class RouteLegViewStateValidation extends Validation<'FLIGHT_NUMBER_EXISTS'|'FLIGHT_NUMBER_FORMAT_IS_VALID'| ''>{

//    constructor({flightNumber, departureAirport, arrivalAirport}: RouteLegViewState) {
//        super(validator =>{
//             validator
//             .check('FLIGHT_NUMBER_EXISTS', !!flightNumber)
//             .check('FLIGHT_NUMBER_FORMAT_IS_VALID', () => formFields.flightNumber.check(flightNumber), 'Invalid flight number.');
//             validator
//             .check()

//        });

//    }
// }

export interface LegViewState {
  blockTime: string;
  stdLowerBound: string;
  stdUpperBound: string;
  originPermission: boolean;
  destinationPermission: boolean;
}
export class LegViewStateValidation extends Validation<
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
    });
  }
}

export interface AircraftIdentityOptionViewState {
  id: Id;
  name: string;
  type: AircraftIdentityType;
  entityId: Id;
}
