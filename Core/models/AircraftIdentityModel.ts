import AircraftIdentityType from '@core/types/aircraft-identity/AircraftIdentityType';
import Validation from '@core/utils/Validation';
import MasterData from '@core/master-data';
import DummyAircraftRegisterModel from './DummyAircraftRegisterModel';

export default interface AircraftIdentityModel {
  readonly type: AircraftIdentityType;
  readonly name: string;
  readonly entityId: string;
}

export class AircraftIdentityValidation extends Validation<'TYPE_EXISTS' | 'TYPE_IS_VALID' | 'NAME_EXISTS' | 'NAME_IS_VALID' | 'ENTITY_ID_EXISTS' | 'ENTITY_ID_IS_VALID'> {
  constructor(data: any, dummyAircraftRegisters: readonly DummyAircraftRegisterModel[]) {
    super(validator =>
      validator.object(data).do(({ type, name, entityId }) => {
        validator.check('TYPE_EXISTS', type).check('TYPE_IS_VALID', () => ['REGISTER', 'TYPE', 'TYPE_EXISTING', 'TYPE_DUMMY', 'GROUP'].includes(type));
        validator.check('NAME_EXISTS', name).check({ badge: 'NAME_IS_VALID', message: 'Only letters, digits, _, + and - characters.' }, () => /^[A-Z0-9_+-]+$/.test(name));
        validator.check('ENTITY_ID_EXISTS', entityId).check('ENTITY_ID_IS_VALID', () => {
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
