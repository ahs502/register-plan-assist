import FlightTimeModel, { FlightTimeValidation } from './FlightTimeModel';
import AircraftSelectionModel, { AircraftSelectionValidation } from '@core/models/AircraftSelectionModel';
import DummyAircraftRegisterModel from '../DummyAircraftRegisterModel';
import Validation from '@ahs502/validation';

export interface FlightScopeModel {
  readonly blockTime: number;
  readonly times: readonly FlightTimeModel[];
  readonly aircraftSelection: AircraftSelectionModel;
  readonly slot: boolean;
  readonly slotComment: string;
  readonly required: boolean;
}

export class FlightScopeValidation extends Validation<
  | 'BLOCK_TIME_EXISTS'
  | 'BLOCK_TIME_IS_VALID'
  | 'BLOCK_TIME_IS_NOT_NEGATIVE'
  | 'BLOCK_TIME_IS_NOT_TOO_LONG'
  | 'SLOT_EXISTS'
  | 'SLOT_IS_VALID'
  | 'SLOT_COMMENT_IS_VALID'
  | 'REQUIRED_EXISTS'
  | 'REQUIRED_IS_VALID',
  {
    readonly times: readonly FlightTimeValidation[];
    readonly aircraftSelection: AircraftSelectionValidation;
  }
> {
  constructor(data: any, dummyAircraftRegisters: readonly DummyAircraftRegisterModel[]) {
    super(validator =>
      validator.object(data).do(({ blockTime, times, aircraftSelection, slot, slotComment, required }) => {
        validator
          .check('BLOCK_TIME_EXISTS', blockTime || blockTime === 0 || isNaN(blockTime))
          .check('BLOCK_TIME_IS_VALID', () => typeof blockTime === 'number' && !isNaN(blockTime))
          .check('BLOCK_TIME_IS_NOT_NEGATIVE', () => blockTime >= 0)
          .check({ badge: 'BLOCK_TIME_IS_NOT_TOO_LONG', message: 'Can not exceed 16 hours.' }, () => blockTime <= 16 * 60);
        validator.array(times).for((time, index) =>
          validator
            .object(time)
            .in('times', index)
            .set(() => new FlightTimeValidation(time))
        );
        validator.in('aircraftSelection').set(new AircraftSelectionValidation(aircraftSelection, dummyAircraftRegisters));
        validator.check('SLOT_EXISTS', slot || slot === false).check('SLOT_IS_VALID', () => typeof slot === 'boolean');
        validator.check('SLOT_COMMENT_IS_VALID', typeof slotComment === 'string');
        validator.check('REQUIRED_EXISTS', required || required === false).check('REQUIRED_IS_VALID', typeof required === 'boolean');
      })
    );
  }
}
