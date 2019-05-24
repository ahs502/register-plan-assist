import MasterDataItem, { MasterDataItems } from './master-data/MasterDataItem';
import AircraftType from './master-data/AircraftType';
import AircraftIdentity from './master-data/AircraftIdentity';
import AircraftSelection from './master-data/AircraftSelection';
import MasterDataAircraftRegister from './master-data/AircraftRegister';
import Airport from './master-data/Airport';
import MasterData from './master-data';

/**
 * A dummy aircraft register related to a specific preplan.
 */
export interface DummyAircraftRegister {
  /**
   * The id of a dummy aircraft register starts with the 'dummy-' prefix.
   */
  readonly id: string;

  readonly name: string;
  readonly aircraftTypeId: string;
}

/**
 * How every aircraft register is treated within each preplan.
 */
export enum AircraftRegisterStatus {
  /**
   * By default, with 0 value.
   */
  Excluded,

  Backup,
  Included
}

/**
 * The selected options for an aircraft register in a preplan.
 */
export interface AircraftRegisterOptions {
  readonly status: AircraftRegisterStatus;
  readonly startingAirportId: string;
}

/**
 * A dictionary of aircraft register options by their id values.
 */
export interface AircraftRegisterOptionsDictionary {
  readonly [id: string]: AircraftRegisterOptions;
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

  readonly status: AircraftRegisterStatus;
  readonly startingAirportId: string;

  constructor(id: string, name: string, aircraftTypeId: string, dummy: boolean, status?: AircraftRegisterStatus, startingAirportId?: string) {
    this.id = id;
    this.name = name;
    this.aircraftTypeId = aircraftTypeId;
    this.dummy = dummy;
    this.status = status || AircraftRegisterStatus.Excluded;
    this.startingAirportId = startingAirportId || AircraftRegister.defaultStartingAirport.id;
  }

  getAircraftType(): AircraftType {
    return MasterData.all.aircraftTypes.id[this.aircraftTypeId];
  }

  getMinimumGroundTime(date: Date, transit: boolean, international: boolean): number {
    return this.getAircraftType().getMinimumGroundTime(date, transit, international);
  }

  static defaultStartingAirport: Airport = MasterData.all.airports.items.find(a => a.name === 'IKA') as Airport;
}

/**
 * Encapsulates all master data and dummy aircraft registers as a single collection.
 */
export class AircraftRegisters extends MasterDataItems<AircraftRegister> {
  constructor(dummyAircraftRegisters: DummyAircraftRegister[], optionsDictionary: AircraftRegisterOptionsDictionary) {
    let masterDataItems = MasterData.all.aircraftRegisters.items.map(a => {
      let options = optionsDictionary[a.id];
      return new AircraftRegister(a.id, a.name, a.aircraftTypeId, false, options && options.status, options && options.startingAirportId);
    });
    let dummyItems = dummyAircraftRegisters.map(a => {
      let options = optionsDictionary[a.id];
      return new AircraftRegister(a.id, a.name, a.aircraftTypeId, true, options && options.status, options && options.startingAirportId);
    });
    super(masterDataItems.concat(dummyItems));
  }

  extractAircraftRegisterOptionsDictionary(): AircraftRegisterOptionsDictionary {
    let result: { [id: string]: AircraftRegisterOptions } = {};
    this.items.forEach(a => (result[a.id] = { status: a.status, startingAirportId: a.startingAirportId }));
    return result;
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
