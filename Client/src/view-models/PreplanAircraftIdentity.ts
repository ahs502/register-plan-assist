import AircraftIdentityType from '@core/types/aircraft-identity/AircraftIdentityType';
import MasterData, { MasterDataItem, AircraftType, AircraftGroup } from '@core/master-data';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from './PreplanAircraftRegister';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';

/**
 * A representive object identifying one or more aircraft registers
 * by pointing to a specific item in master data.
 */
export default abstract class PreplanAircraftIdentity {
  readonly type: AircraftIdentityType;
  readonly entity: MasterDataItem;

  protected readonly aircraftRegisters: PreplanAircraftRegisters;

  protected constructor(raw: AircraftIdentityModel, entity: MasterDataItem, aircraftRegisters: PreplanAircraftRegisters) {
    this.type = raw.type;
    this.entity = entity;

    this.aircraftRegisters = aircraftRegisters;
  }

  static parse(raw: AircraftIdentityModel, aircraftRegisters: PreplanAircraftRegisters): PreplanAircraftIdentity {
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
        return new PreplanAircraftGroupIdentity(raw, aircraftRegisters);
      default:
        throw 'Invalid aircraft identity type.';
    }
  }

  /**
   * Returns the set of all corresponding preplan aircraft registers
   * for this aircraft identity, regardless of their status.
   */
  abstract resolve(): Set<PreplanAircraftRegister>;
}

export class PreplanAircraftRegisterIdentity extends PreplanAircraftIdentity {
  constructor(raw: AircraftIdentityModel, aircraftRegisters: PreplanAircraftRegisters) {
    super(raw, aircraftRegisters.id[raw.entityId], aircraftRegisters);
  }

  resolve(): Set<PreplanAircraftRegister> {
    return new Set([this.entity as PreplanAircraftRegister]);
  }
}

export class PreplanAircraftTypeIdentity extends PreplanAircraftIdentity {
  constructor(raw: AircraftIdentityModel, aircraftRegisters: PreplanAircraftRegisters) {
    super(raw, MasterData.all.aircraftTypes.id[raw.entityId], aircraftRegisters);
  }

  resolve(): Set<PreplanAircraftRegister> {
    return new Set(this.aircraftRegisters.items.filter(r => r.aircraftType.id === this.entity.id));
  }
}

export class PreplanAircraftTypeExistingIdentity extends PreplanAircraftIdentity {
  constructor(raw: AircraftIdentityModel, aircraftRegisters: PreplanAircraftRegisters) {
    super(raw, MasterData.all.aircraftTypes.id[raw.entityId], aircraftRegisters);
  }

  resolve(): Set<PreplanAircraftRegister> {
    return new Set(this.aircraftRegisters.items.filter(r => r.aircraftType.id === this.entity.id && !r.dummy));
  }
}

export class PreplanAircraftTypeDummyIdentity extends PreplanAircraftIdentity {
  constructor(raw: AircraftIdentityModel, aircraftRegisters: PreplanAircraftRegisters) {
    super(raw, MasterData.all.aircraftTypes.id[raw.entityId], aircraftRegisters);
  }

  resolve(): Set<PreplanAircraftRegister> {
    return new Set(this.aircraftRegisters.items.filter(r => r.aircraftType.id === this.entity.id && r.dummy));
  }
}

export class PreplanAircraftGroupIdentity extends PreplanAircraftIdentity {
  constructor(raw: AircraftIdentityModel, aircraftRegisters: PreplanAircraftRegisters) {
    super(raw, MasterData.all.aircraftGroups.id[raw.entityId], aircraftRegisters);
  }

  resolve(): Set<PreplanAircraftRegister> {
    return new Set((this.entity as AircraftGroup).aircraftRegisters.map(r => this.aircraftRegisters.id[r.id]));
  }
}
