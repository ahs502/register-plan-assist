import AircraftIdentityType from '@core/types/aircraft-identity/AircraftIdentityType';
import MasterData, { MasterDataItem, AircraftType, AircraftGroup } from '@core/master-data';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from './PreplanAircraftRegister';

/**
 * A representive object identifying one or more aircraft registers
 * by pointing to a specific item in master data.
 */
export default abstract class AircraftIdentity {
  readonly type: AircraftIdentityType;
  readonly name: string;
  readonly entity: MasterDataItem;

  protected readonly aircraftRegisters: PreplanAircraftRegisters;

  constructor(raw: AircraftIdentityModel, entity: MasterDataItem, aircraftRegisters: PreplanAircraftRegisters) {
    this.type = raw.type;
    this.name = raw.name;
    this.entity = entity;

    this.aircraftRegisters = aircraftRegisters;
  }

  static parse(raw: AircraftIdentityModel, aircraftRegisters: PreplanAircraftRegisters): AircraftIdentity {
    switch (raw.type) {
      case 'REGISTER':
        return new AircraftRegisterIdentity(raw, aircraftRegisters);
      case 'TYPE':
        return new AircraftTypeIdentity(raw, aircraftRegisters);
      case 'TYPE_EXISTING':
        return new AircraftTypeExistingIdentity(raw, aircraftRegisters);
      case 'TYPE_DUMMY':
        return new AircraftTypeDummyIdentity(raw, aircraftRegisters);
      case 'GROUP':
        return new AircraftGroupIdentity(raw, aircraftRegisters);
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

export class AircraftRegisterIdentity extends AircraftIdentity {
  readonly entity!: PreplanAircraftRegister;

  constructor(raw: AircraftIdentityModel, aircraftRegisters: PreplanAircraftRegisters) {
    super(raw, aircraftRegisters.id[raw.entityId], aircraftRegisters);
  }

  resolve(): Set<PreplanAircraftRegister> {
    return new Set([this.entity]);
  }
}

export class AircraftTypeIdentity extends AircraftIdentity {
  readonly entity!: AircraftType;

  constructor(raw: AircraftIdentityModel, aircraftRegisters: PreplanAircraftRegisters) {
    super(raw, MasterData.all.aircraftTypes.id[raw.entityId], aircraftRegisters);
  }

  resolve(): Set<PreplanAircraftRegister> {
    return new Set(this.aircraftRegisters.items.filter(r => r.aircraftType.id === this.entity.id));
  }
}

export class AircraftTypeExistingIdentity extends AircraftIdentity {
  readonly entity!: AircraftType;

  constructor(raw: AircraftIdentityModel, aircraftRegisters: PreplanAircraftRegisters) {
    super(raw, MasterData.all.aircraftTypes.id[raw.entityId], aircraftRegisters);
  }

  resolve(): Set<PreplanAircraftRegister> {
    return new Set(this.aircraftRegisters.items.filter(r => r.aircraftType.id === this.entity.id && !r.dummy));
  }
}

export class AircraftTypeDummyIdentity extends AircraftIdentity {
  readonly entity!: AircraftType;

  constructor(raw: AircraftIdentityModel, aircraftRegisters: PreplanAircraftRegisters) {
    super(raw, MasterData.all.aircraftTypes.id[raw.entityId], aircraftRegisters);
  }

  resolve(): Set<PreplanAircraftRegister> {
    return new Set(this.aircraftRegisters.items.filter(r => r.aircraftType.id === this.entity.id && r.dummy));
  }
}

export class AircraftGroupIdentity extends AircraftIdentity {
  readonly entity!: AircraftGroup;

  constructor(raw: AircraftIdentityModel, aircraftRegisters: PreplanAircraftRegisters) {
    super(raw, MasterData.all.aircraftGroups.id[raw.entityId], aircraftRegisters);
  }

  resolve(): Set<PreplanAircraftRegister> {
    return new Set(this.entity.aircraftRegisters.map(r => this.aircraftRegisters.id[r.id]));
  }
}
