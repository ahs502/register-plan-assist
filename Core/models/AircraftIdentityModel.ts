import AircraftIdentityType, { AircraftIdentityTypes } from '@core/types/AircraftIdentityType';
import Id from '@core/types/Id';
import Validation from '@ahs502/validation';
import MasterDataCollection from '@core/types/MasterDataCollection';
import AircraftRegisterModel from '@core/models/master-data/AircraftRegisterModel';
import AircraftTypeModel from '@core/models/master-data/AircraftTypeModel';
import AircraftRegisterGroupModel from '@core/models/master-data/AircraftRegisterGroupModel';

export default interface AircraftIdentityModel {
  readonly type: AircraftIdentityType;
  readonly entityId: Id;
}

export class AircraftIdentityModelValidation extends Validation {
  constructor(
    data: AircraftIdentityModel,
    aircraftTypes: MasterDataCollection<AircraftTypeModel>,
    aircraftRegisters: MasterDataCollection<AircraftRegisterModel>,
    aircraftRegisterGroups: MasterDataCollection<AircraftRegisterGroupModel>,
    dummyAircraftRegisterIds: readonly Id[]
  ) {
    super(validator =>
      validator.object(data).then(({ type, entityId }) => {
        validator.must(AircraftIdentityTypes.includes(type), typeof entityId === 'string', !!entityId).must(() => {
          switch (type) {
            case 'REGISTER':
              return entityId in aircraftRegisters.id || dummyAircraftRegisterIds.includes(entityId);
            case 'TYPE':
            case 'TYPE_EXISTING':
            case 'TYPE_DUMMY':
              return entityId in aircraftTypes.id;
            case 'GROUP':
              return entityId in aircraftRegisterGroups;
            default:
              return false;
          }
        });
      })
    );
  }
}
