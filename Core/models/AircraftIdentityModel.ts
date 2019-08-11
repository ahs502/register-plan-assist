import AircraftIdentityType, { AircraftIdentityTypes } from '@core/types/aircraft-identity/AircraftIdentityType';
import MasterData from '@core/master-data';
import DummyAircraftRegisterModel from './DummyAircraftRegisterModel';
import Validation from '@ahs502/validation';

export default interface AircraftIdentityModel {
  readonly type: AircraftIdentityType;
  readonly entityId: string;
}

export class AircraftIdentityValidation extends Validation<'TYPE_EXISTS' | 'TYPE_IS_VALID' | 'ENTITY_ID_EXISTS' | 'ENTITY_ID_IS_VALID'> {
  constructor(aircraftIdentity: AircraftIdentityModel, dummyAircraftRegisters: readonly DummyAircraftRegisterModel[]) {
    super(validator =>
      validator.object(aircraftIdentity).do(({ type, entityId }) => {
        validator.check('TYPE_EXISTS', !!type).check('TYPE_IS_VALID', () => AircraftIdentityTypes.includes(type));
        validator.check('ENTITY_ID_EXISTS', !!entityId).check('ENTITY_ID_IS_VALID', () => {
          switch (type) {
            case 'REGISTER':
              return !!MasterData.all.aircraftRegisters.id[entityId] || dummyAircraftRegisters.some(r => r.id === entityId);
            case 'TYPE':
            case 'TYPE_EXISTING':
            case 'TYPE_DUMMY':
              return !!MasterData.all.aircraftTypes.id[entityId];
            case 'GROUP':
              return !!MasterData.all.aircraftGroups.id[entityId];
            default:
              return false;
          }
        });
      })
    );
  }
}
