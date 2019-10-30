import AircraftIdentityType, { AircraftIdentityTypes } from '@core/types/AircraftIdentityType';
import Id from '@core/types/Id';
import Validation from '@ahs502/validation';
import MasterData from '@core/master-data';

export default interface AircraftIdentityModel {
  readonly type: AircraftIdentityType;
  readonly entityId: Id;
}

export class AircraftIdentityModelValidation extends Validation {
  constructor(data: AircraftIdentityModel, dummyAircraftRegisterIds: readonly Id[]) {
    super(validator =>
      validator.object(data).then(({ type, entityId }) => {
        validator.must(AircraftIdentityTypes.includes(type), typeof entityId === 'string', !!entityId).must(() => {
          switch (type) {
            case 'REGISTER':
              return entityId in MasterData.all.aircraftRegisters.id || dummyAircraftRegisterIds.includes(entityId);
            case 'TYPE':
            case 'TYPE_EXISTING':
            case 'TYPE_DUMMY':
              return entityId in MasterData.all.aircraftTypes.id;
            case 'GROUP':
              return entityId in MasterData.all.aircraftRegisterGroups;
            default:
              return false;
          }
        });
      })
    );
  }
}
