import AircraftType from './master-data/AircraftType';
import AircraftRegister from './master-data/AircraftRegister';
import AircraftGroup from './master-data/AircraftGroup';
import IClonable from '../utils/IClonable';
import masterData from './master-data';

export enum AircraftIdentityType {
  AircraftRegister,
  AircraftType,
  AircraftGroup
}

/**
 * A representive object identifying one or more aircraft registers
 * by pointing to a specific item in master data.
 */
export default abstract class AircraftIdentity implements IClonable<AircraftIdentity> {
  type: AircraftIdentityType;
  entityId: string;

  constructor(type: AircraftIdentityType, entityId: string) {
    this.type = type;
    this.entityId = entityId;
  }

  abstract clone(): AircraftIdentity;

  /**
   * Returns the list of all aircraft registers which are identified by this object.
   */
  abstract getAircraftRegisters(): AircraftRegister[];
}

/**
 * An aircraft identity based on one aircraft register.
 */
export class AircraftRegisterIdentity extends AircraftIdentity {
  constructor(aircraftRegisterId: string) {
    super(AircraftIdentityType.AircraftRegister, aircraftRegisterId);
  }

  clone(): AircraftRegisterIdentity {
    return new AircraftRegisterIdentity(this.entityId);
  }
  getAircraftRegisters(): AircraftRegister[] {
    return [masterData.aircraftRegisters.id[this.entityId]];
  }

  /**
   * Returns the corresponding aircraft register.
   */
  getAircraftRegister(): AircraftRegister {
    return masterData.aircraftRegisters.id[this.entityId];
  }
}

/**
 * An aircraft identity based on one aircraft type.
 */
export class AircraftTypeIdentity extends AircraftIdentity {
  constructor(aircraftTypeId: string) {
    super(AircraftIdentityType.AircraftType, aircraftTypeId);
  }

  clone(): AircraftTypeIdentity {
    return new AircraftTypeIdentity(this.entityId);
  }
  getAircraftRegisters(): AircraftRegister[] {
    return masterData.aircraftRegisters.filter(r => r.aircraftTypeId === this.entityId);
  }

  /**
   * Returns the corresponding aircraft type.
   */
  getAircraftType(): AircraftType {
    return masterData.aircraftTypes.id[this.entityId];
  }
}

/**
 * An aircraft identity based on one aircraft group.
 */
export class AircraftGroupIdentity extends AircraftIdentity {
  constructor(aircraftGroupId: string) {
    super(AircraftIdentityType.AircraftGroup, aircraftGroupId);
  }

  clone(): AircraftGroupIdentity {
    return new AircraftGroupIdentity(this.entityId);
  }
  getAircraftRegisters(): AircraftRegister[] {
    return masterData.aircraftGroups.id[this.entityId].getAircraftRegisters();
  }

  /**
   * Returns the corresponding aircraft group.
   */
  getAircraftGroup(): AircraftGroup {
    return masterData.aircraftGroups.id[this.entityId];
  }
}
