import MasterData from '@core/master-data';
import DummyAircraftRegisterModel from '../DummyAircraftRegisterModel';
import Validation from '@ahs502/validation';

export default interface FlightModel {
  readonly std: number;
  readonly aircraftRegisterId?: string;
}

// export class FlightValidation extends Validation<'STD_EXISTS' | 'STD_IS_VALID' | 'STD_IS_NOT_NEGATIVE' | 'AIRCRAFT_REGISTER_ID_IS_VALID'> {
//   constructor(flight: FlightModel, dummyAircraftRegistersId: readonly string[]) {
//     super(validator =>
//       validator.object(flight).do(({ std, aircraftRegisterId }) => {
//         validator
//           .check('STD_EXISTS', !!std || std === 0 || isNaN(std))
//           .check('STD_IS_VALID', () => !isNaN(std))
//           .check('STD_IS_NOT_NEGATIVE', () => std >= 0);
//         validator
//           .if(!!aircraftRegisterId)
//           .check('AIRCRAFT_REGISTER_ID_IS_VALID', !!MasterData.all.aircraftRegisters.id[aircraftRegisterId] || dummyAircraftRegistersId.some(a => a === aircraftRegisterId));
//       })
//     );
//   }
// }
