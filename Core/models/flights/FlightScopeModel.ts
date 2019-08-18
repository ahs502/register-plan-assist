import FlightTimeModel, { FlightTimeValidation } from './FlightTimeModel';
import AircraftSelectionModel, { AircraftSelectionValidation } from '@core/models/AircraftSelectionModel';
import DummyAircraftRegisterModel from '../DummyAircraftRegisterModel';
import Validation from '@ahs502/validation';
import Rsx from '@core/types/flight-requirement/Rsx';

export interface FlightScopeModel {
  readonly blockTime: number;
  readonly times: readonly FlightTimeModel[];
  readonly aircraftSelection: AircraftSelectionModel;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;
  readonly rsx: Rsx;
  readonly required: boolean;
}

//TODO: Check for permissions and rsx too:
export class FlightScopeValidation extends Validation<
  'BLOCK_TIME_EXISTS' | 'BLOCK_TIME_IS_VALID' | 'BLOCK_TIME_IS_NOT_NEGATIVE' | 'BLOCK_TIME_IS_NOT_TOO_LONG' | 'REQUIRED_EXISTS' | 'REQUIRED_IS_VALID',
  {
    readonly times: readonly FlightTimeValidation[];
    readonly aircraftSelection: AircraftSelectionValidation;
  }
> {
  constructor(flightScope: FlightScopeModel, dummyAircraftRegisters: readonly DummyAircraftRegisterModel[]) {
    super(validator =>
      validator.object(flightScope).do(({ blockTime, times, aircraftSelection, required }) => {
        validator
          .check('BLOCK_TIME_EXISTS', !!blockTime || blockTime === 0 || isNaN(blockTime))
          .check('BLOCK_TIME_IS_VALID', () => typeof blockTime === 'number' && !isNaN(blockTime))
          .check('BLOCK_TIME_IS_NOT_NEGATIVE', () => blockTime >= 0)
          .check({ badge: 'BLOCK_TIME_IS_NOT_TOO_LONG', message: 'Can not exceed 16 hours.' }, () => blockTime <= 16 * 60);
        validator.array(times).each((time, index) => validator.into('times', index).set(() => new FlightTimeValidation(time)));
        validator.into('aircraftSelection').set(new AircraftSelectionValidation(aircraftSelection, dummyAircraftRegisters));
        validator.check('REQUIRED_EXISTS', required || required === false).check('REQUIRED_IS_VALID', typeof required === 'boolean');
      })
    );
  }
}
