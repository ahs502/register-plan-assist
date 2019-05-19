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

export default abstract class AircraftIdentity implements IClonable<AircraftIdentity> {
  type: AircraftIdentityType;
  entityId: string;

  constructor(type: AircraftIdentityType, entityId: string) {
    this.type = type;
    this.entityId = entityId;
  }

  abstract clone(): AircraftIdentity;
  abstract getAircraftRegisters(): AircraftRegister[];
}

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

  getAircraftRegister(): AircraftRegister {
    return masterData.aircraftRegisters.id[this.entityId];
  }
}

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

  getAircraftType(): AircraftType {
    return masterData.aircraftTypes.id[this.entityId];
  }
}

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

  getAircraftGroup(): AircraftGroup {
    return masterData.aircraftGroups.id[this.entityId];
  }
}
