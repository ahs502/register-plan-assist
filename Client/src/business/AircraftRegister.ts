import MasterDataItem, { MasterDataItems } from './master-data/MasterDataItem';
import AircraftType from './master-data/AircraftType';
import AircraftIdentity from './master-data/AircraftIdentity';
import AircraftSelection from './master-data/AircraftSelection';
import MasterDataAircraftRegister from './master-data/AircraftRegister';
import MasterData from './master-data';

/**
 * A dummy aircraft register related to a specific preplan.
 */
export interface DummyAircraftRegister {
  readonly id: number;
  readonly name: string;
  readonly aircraftTypeId: string;
}

/**
 * An enhanced aircraft register capable of presenting both master data and dummy aircraft registers.
 */
export default class AircraftRegister implements MasterDataItem {
  /**
   * The id of the corresponding aircraft registrer in the master data or
   * the prefix 'dummy-' followed by the id (no.) of the dummy aircraft register
   * within the loaded preplan.
   */
  readonly id: string;

  readonly name: string;
  readonly aircraftTypeId: string;

  /**
   * Whether this enhanced aircraft register is a dummy one or not.
   */
  readonly dummy: boolean;

  constructor(id: string, name: string, aircraftTypeId: string, dummy: boolean) {
    this.id = id;
    this.name = name;
    this.aircraftTypeId = aircraftTypeId;
    this.dummy = dummy;
  }

  getAircraftType(): AircraftType {
    return MasterData.all.aircraftTypes.id[this.aircraftTypeId];
  }

  getMinimumGroundTime(date: Date, transit: boolean, international: boolean): number {
    return this.getAircraftType().getMinimumGroundTime(date, transit, international);
  }

  static fromMasterDataAircraftRegister(masterDataAircraftRegister: MasterDataAircraftRegister): AircraftRegister {
    return new AircraftRegister(masterDataAircraftRegister.id, masterDataAircraftRegister.name, masterDataAircraftRegister.aircraftTypeId, false);
  }
  static fromDummyAircraftRegister(dummyAircraftRegister: DummyAircraftRegister): AircraftRegister {
    return new AircraftRegister(`dummy-${dummyAircraftRegister.id}`, dummyAircraftRegister.name, dummyAircraftRegister.aircraftTypeId, true);
  }
}

/**
 * Encapsulates all master data and dummy aircraft registers as a single collection.
 */
export class AircraftRegisters extends MasterDataItems<AircraftRegister> {
  constructor(dummyAircraftRegisters: DummyAircraftRegister[]) {
    let masterDataItems = MasterData.all.aircraftRegisters.items.map(AircraftRegister.fromMasterDataAircraftRegister);
    let dummyItems = dummyAircraftRegisters.map(AircraftRegister.fromDummyAircraftRegister);
    super(masterDataItems.concat(dummyItems));
  }

  resolveAircraftIdentity(aircraftIdentity: AircraftIdentity): AircraftRegister[] {
    switch (aircraftIdentity.type) {
      case 'register':
        return [this.id[aircraftIdentity.entityId]];

      case 'type':
        return this.items.filter(a => a.aircraftTypeId === aircraftIdentity.entityId);

      case 'type existing':
        return this.items.filter(a => a.aircraftTypeId === aircraftIdentity.entityId && !a.dummy);

      case 'type dummy':
        return this.items.filter(a => a.aircraftTypeId === aircraftIdentity.entityId && a.dummy);

      case 'group':
        return MasterData.all.aircraftGroups.id[aircraftIdentity.entityId].aircraftRegisterIds.map(id => this.id[id]);
    }
  }

  resolveAircraftSelection(aircraftSelection: AircraftSelection): AircraftRegister[] {
    let result: AircraftRegister[] = [];
    aircraftSelection.allowedIdentities.forEach(i => this.resolveAircraftIdentity(i).forEach(a => result.includes(a) || result.push(a)));
    aircraftSelection.forbiddenIdentities.forEach(i => this.resolveAircraftIdentity(i).forEach(a => result.includes(a) && result.remove(a)));
    return result;
  }
}
