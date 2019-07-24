import AircraftIdentityType from '@core/types/aircraft-identity/AircraftIdentityType';
import MasterDataItem from './MasterDataItem';
import { AircraftRegisters } from './AircraftRegister';
import { AircraftTypes } from './AircraftType';
import { AircraftGroups } from './AircraftGroup';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';

/**
 * A representive object identifying one or more aircraft registers
 * by pointing to a specific item in master data.
 */
export default class AircraftIdentity {
  readonly type: AircraftIdentityType;
  readonly entity: MasterDataItem;

  constructor(raw: AircraftIdentityModel, aircraftRegisters: AircraftRegisters, aircraftTypes: AircraftTypes, aircraftGroups: AircraftGroups) {
    this.type = raw.type;

    switch (raw.type) {
      case 'REGISTER':
        this.entity = aircraftRegisters.id[raw.entityId];
        break;
      case 'TYPE':
      case 'TYPE_EXISTING':
      case 'TYPE_DUMMY':
        this.entity = aircraftTypes.id[raw.entityId];
        break;
      case 'GROUP':
        this.entity = aircraftGroups.id[raw.entityId];
        break;
      default:
        throw 'Invalid aircraft identity type.';
    }
  }
}
