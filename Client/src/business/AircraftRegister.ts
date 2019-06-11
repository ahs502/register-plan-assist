import MasterDataItem, { MasterDataItems } from './master-data/MasterDataItem';
import AircraftType from './master-data/AircraftType';
import AircraftSelection, { AircraftIdentity } from './master-data/AircraftSelection';
import Airport from './master-data/Airport';
import MasterData from './master-data';

/**
 * A dummy aircraft register related to a specific preplan.
 */
export interface DummyAircraftRegisterModel {
  /**
   * The id of a dummy aircraft register starts with a 'dummy-' prefix.
   */
  id: string;

  name: string;
  aircraftTypeId: string;
}

/**
 * How every aircraft register is treated within each preplan.
 */
export type AircraftRegisterStatus = 'IGNORED' | 'BACKUP' | 'INCLUDED';

/**
 * The selected options for an aircraft register in a preplan.
 */
export interface AircraftRegisterOptions {
  status: AircraftRegisterStatus;
  startingAirportId: string;
}

/**
 * A dictionary of aircraft register options by their id values.
 */
export interface AircraftRegisterOptionsDictionary {
  [id: string]: Readonly<AircraftRegisterOptions>;
}

/**
 * An enhanced aircraft register capable of presenting both master data and dummy aircraft registers.
 */
export default class AircraftRegister implements MasterDataItem {
  /**
   * The id of the corresponding aircraft registrer in the master data or
   * a prefix 'dummy-' followed by the id (no.) of the dummy aircraft register
   * within the loaded preplan.
   */
  readonly id: string;

  readonly name: string;
  readonly aircraftTypeId: string;

  /**
   * Whether this enhanced aircraft register is a dummy one or not.
   */
  readonly dummy: boolean;

  readonly options: Readonly<AircraftRegisterOptions>;

  constructor(id: string, name: string, aircraftTypeId: string, dummy: boolean, options?: Readonly<AircraftRegisterOptions>) {
    this.id = id;
    this.name = name;
    this.aircraftTypeId = aircraftTypeId;
    this.dummy = dummy;
    this.options = options || this.getDefaultOptions();
  }

  getAircraftType(): AircraftType {
    return MasterData.all.aircraftTypes.id[this.aircraftTypeId];
  }
  getMinimumGroundTime(date: Date, transit: boolean, international: boolean): number {
    return this.getAircraftType().getMinimumGroundTime(date, transit, international);
  }

  getDefaultStartingAirport(): Airport {
    return MasterData.all.airports.items.find(a => a.name === 'IKA') as Airport; //TODO: Implement something better!
  }
  getDefaultOptions(): Readonly<AircraftRegisterOptions> {
    return {
      status: 'IGNORED',
      startingAirportId: this.getDefaultStartingAirport().id
    };
  }
}

/**
 * Encapsulates all master data and dummy aircraft registers as a single collection.
 */
export class AircraftRegisters extends MasterDataItems<AircraftRegister> {
  constructor(dummyAircraftRegisters: ReadonlyArray<DummyAircraftRegisterModel>, aircraftRegisterOptionsDictionary: Readonly<AircraftRegisterOptionsDictionary>) {
    let masterDataItems = MasterData.all.aircraftRegisters.items.map(a => new AircraftRegister(a.id, a.name, a.aircraftTypeId, false, aircraftRegisterOptionsDictionary[a.id]));
    let dummyItems = dummyAircraftRegisters.map(a => new AircraftRegister(a.id, a.name, a.aircraftTypeId, true, aircraftRegisterOptionsDictionary[a.id]));
    super(masterDataItems.concat(dummyItems));
  }

  extractAircraftRegisterOptionsDictionary(): Readonly<AircraftRegisterOptionsDictionary> {
    let result: { [id: string]: Readonly<AircraftRegisterOptions> } = {};
    this.items.forEach(a => (result[a.id] = a.options));
    return result;
  }

  resolveAircraftIdentity(aircraftIdentity: AircraftIdentity, status: AircraftRegisterStatus = 'INCLUDED'): ReadonlyArray<AircraftRegister> {
    let result: AircraftRegister[];
    switch (aircraftIdentity.type) {
      case 'REGISTER':
        result = [this.id[aircraftIdentity.entityId]];
        break;

      case 'TYPE':
        result = this.items.filter(a => a.aircraftTypeId === aircraftIdentity.entityId);
        break;

      case 'TYPE_EXISTING':
        result = this.items.filter(a => a.aircraftTypeId === aircraftIdentity.entityId && !a.dummy);
        break;

      case 'TYPE_DUMMY':
        result = this.items.filter(a => a.aircraftTypeId === aircraftIdentity.entityId && a.dummy);
        break;

      case 'GROUP':
        result = MasterData.all.aircraftGroups.id[aircraftIdentity.entityId].aircraftRegisterIds.map(id => this.id[id]);
        break;

      default:
        result = [];
    }
    return result.filter(a => a.options.status === status);
  }

  resolveAircraftSelection(aircraftSelection: AircraftSelection): ReadonlyArray<AircraftRegister> {
    let result: AircraftRegister[] = [];
    aircraftSelection.allowedIdentities.forEach(i => this.resolveAircraftIdentity(i).forEach(a => result.includes(a) || result.push(a)));
    aircraftSelection.forbiddenIdentities.forEach(i => this.resolveAircraftIdentity(i).forEach(a => result.includes(a) && result.remove(a)));
    return result;
  }

  findBackupFromAircraftSelection(aircraftSelection: AircraftSelection): AircraftRegister | undefined {
    let allowed: AircraftRegister[] = [];
    let forbidden: AircraftRegister[] = [];
    aircraftSelection.allowedIdentities.forEach(i => this.resolveAircraftIdentity(i).forEach(a => allowed.includes(a) || allowed.push(a)));
    aircraftSelection.forbiddenIdentities.forEach(i => this.resolveAircraftIdentity(i).forEach(a => forbidden.includes(a) || forbidden.push(a)));
    return allowed.find(a => !forbidden.includes(a)) || allowed[0];
  }
}
