import AircraftIdentityType from '@core/types/AircraftIdentityType';
import MasterData, { MasterDataItem, AircraftIdentity } from '@core/master-data';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from './PreplanAircraftRegister';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';

/**
 * A representive object identifying one or more aircraft registers
 * by pointing to a specific item in master data.
 */
export default abstract class PreplanAircraftIdentity {
  readonly type: AircraftIdentityType;
  readonly entity: MasterDataItem;

  // Computational:

  /**
   * The set of all corresponding preplan aircraft registers
   * for this aircraft identity, regardless of their status.
   */
  readonly aircraftRegisters: Set<PreplanAircraftRegister>;

  protected constructor(raw: AircraftIdentityModel | AircraftIdentity, entity: MasterDataItem, aircraftRegisters: readonly PreplanAircraftRegister[]) {
    this.type = raw.type;
    this.entity = entity;
    this.aircraftRegisters = new Set(aircraftRegisters);
  }

  static parse(raw: AircraftIdentityModel | AircraftIdentity, aircraftRegisters: PreplanAircraftRegisters): PreplanAircraftIdentity {
    switch (raw.type) {
      case 'REGISTER':
        return new PreplanAircraftRegisterIdentity(raw, aircraftRegisters);
      case 'TYPE':
        return new PreplanAircraftTypeIdentity(raw, aircraftRegisters);
      case 'TYPE_EXISTING':
        return new PreplanAircraftTypeExistingIdentity(raw, aircraftRegisters);
      case 'TYPE_DUMMY':
        return new PreplanAircraftTypeDummyIdentity(raw, aircraftRegisters);
      case 'GROUP':
        return new PreplanAircraftRegisterGroupIdentity(raw, aircraftRegisters);
      default:
        throw 'Invalid aircraft identity type.';
    }
  }
}

export class PreplanAircraftRegisterIdentity extends PreplanAircraftIdentity {
  constructor(raw: AircraftIdentityModel | AircraftIdentity, aircraftRegisters: PreplanAircraftRegisters) {
    const entityId = raw instanceof AircraftIdentity ? raw.entity.id : raw.entityId;
    super(raw, aircraftRegisters.id[entityId], [aircraftRegisters.id[entityId]]);
  }
}

export class PreplanAircraftTypeIdentity extends PreplanAircraftIdentity {
  constructor(raw: AircraftIdentityModel | AircraftIdentity, aircraftRegisters: PreplanAircraftRegisters) {
    const entityId = raw instanceof AircraftIdentity ? raw.entity.id : raw.entityId;
    super(
      raw,
      MasterData.all.aircraftTypes.id[entityId],
      aircraftRegisters.items.filter(r => r.aircraftType.id === entityId)
    );
  }
}

export class PreplanAircraftTypeExistingIdentity extends PreplanAircraftIdentity {
  constructor(raw: AircraftIdentityModel | AircraftIdentity, aircraftRegisters: PreplanAircraftRegisters) {
    const entityId = raw instanceof AircraftIdentity ? raw.entity.id : raw.entityId;
    super(
      raw,
      MasterData.all.aircraftTypes.id[entityId],
      aircraftRegisters.items.filter(r => r.aircraftType.id === entityId && !r.dummy)
    );
  }
}

export class PreplanAircraftTypeDummyIdentity extends PreplanAircraftIdentity {
  constructor(raw: AircraftIdentityModel | AircraftIdentity, aircraftRegisters: PreplanAircraftRegisters) {
    const entityId = raw instanceof AircraftIdentity ? raw.entity.id : raw.entityId;
    super(
      raw,
      MasterData.all.aircraftTypes.id[entityId],
      aircraftRegisters.items.filter(r => r.aircraftType.id === entityId && r.dummy)
    );
  }
}

export class PreplanAircraftRegisterGroupIdentity extends PreplanAircraftIdentity {
  constructor(raw: AircraftIdentityModel | AircraftIdentity, aircraftRegisters: PreplanAircraftRegisters) {
    const entityId = raw instanceof AircraftIdentity ? raw.entity.id : raw.entityId;
    super(
      raw,
      MasterData.all.aircraftRegisterGroups.id[entityId],
      MasterData.all.aircraftRegisterGroups.id[entityId].aircraftRegisters.map(r => aircraftRegisters.id[r.id])
    );
  }
}
