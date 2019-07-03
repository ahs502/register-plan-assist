import MasterData, { MasterDataItem, MasterDataItems, AircraftType, Airport } from '@core/master-data';
import AircraftRegisterOptions, { AircraftRegisterOptionsDictionary, AircraftRegisterStatus } from '@core/types/AircraftRegisterOptions';
import DummyAircraftRegisterModel from '@core/models/DummyAircraftRegisterModel';
import AircraftIdentity from '@core/types/AircraftIdentity';
import AircraftSelection from '@core/types/AircraftSelection';

/**
 * An enhanced aircraft register capable of presenting both master data and dummy aircraft registers.
 */
export default class PreplanAircraftRegister implements MasterDataItem {
  /**
   * The id of the corresponding aircraft registrer in the master data or
   * a prefix 'dummy-' followed by the id (no.) of the dummy aircraft register
   * within the loaded preplan.
   */
  readonly id: string;

  readonly name: string;
  readonly aircraftType: AircraftType;

  /**
   * Whether this enhanced aircraft register is a dummy one or not.
   */
  readonly dummy: boolean;

  readonly options: AircraftRegisterOptions;

  constructor(id: string, name: string, aircraftType: AircraftType, dummy: boolean, options?: AircraftRegisterOptions) {
    this.id = id;
    this.name = name;
    this.aircraftType = aircraftType;
    this.dummy = dummy;
    this.options = options || this.getDefaultOptions();
  }

  getMinimumGroundTime(date: Date, transit: boolean, international: boolean): number {
    return this.aircraftType.getMinimumGroundTime(date, transit, international);
  }

  getDefaultStartingAirport(): Airport {
    return MasterData.all.airports.items.find(a => a.name === 'IKA')!; //TODO: Implement something better!
  }
  getDefaultOptions(): AircraftRegisterOptions {
    return {
      status: 'IGNORED',
      startingAirportId: this.getDefaultStartingAirport().id
    };
  }
}

/**
 * Encapsulates all master data and dummy aircraft registers as a single collection.
 */
export class PreplanAircraftRegisters extends MasterDataItems<PreplanAircraftRegister> {
  constructor(dummyAircraftRegisters: readonly DummyAircraftRegisterModel[], aircraftRegisterOptionsDictionary: AircraftRegisterOptionsDictionary) {
    let masterDataItems = MasterData.all.aircraftRegisters.items.map(
      a => new PreplanAircraftRegister(a.id, a.name, a.aircraftType, false, aircraftRegisterOptionsDictionary[a.id])
    );
    let dummyItems = dummyAircraftRegisters.map(
      a => new PreplanAircraftRegister(a.id, a.name, MasterData.all.aircraftTypes.id[a.aircraftTypeId], true, aircraftRegisterOptionsDictionary[a.id])
    );
    super(masterDataItems.concat(dummyItems));
  }

  resolveAircraftIdentity(aircraftIdentity: AircraftIdentity, status: AircraftRegisterStatus = 'INCLUDED'): readonly PreplanAircraftRegister[] {
    let result: PreplanAircraftRegister[];
    switch (aircraftIdentity.type) {
      case 'REGISTER':
        result = [this.id[aircraftIdentity.entityId]];
        break;

      case 'TYPE':
        result = this.items.filter(a => a.aircraftType.id === aircraftIdentity.entityId);
        break;

      case 'TYPE_EXISTING':
        result = this.items.filter(a => a.aircraftType.id === aircraftIdentity.entityId && !a.dummy);
        break;

      case 'TYPE_DUMMY':
        result = this.items.filter(a => a.aircraftType.id === aircraftIdentity.entityId && a.dummy);
        break;

      case 'GROUP':
        result = MasterData.all.aircraftGroups.id[aircraftIdentity.entityId].aircraftRegisters.map(a => this.id[a.id]);
        break;

      default:
        result = [];
    }
    return result.filter(a => a.options.status === status);
  }

  resolveAircraftSelection(aircraftSelection: AircraftSelection): ReadonlyArray<PreplanAircraftRegister> {
    let result: PreplanAircraftRegister[] = [];
    aircraftSelection.allowedIdentities.forEach(i => this.resolveAircraftIdentity(i).forEach(a => result.includes(a) || result.push(a)));
    aircraftSelection.forbiddenIdentities.forEach(i => this.resolveAircraftIdentity(i).forEach(a => result.includes(a) && result.remove(a)));
    return result;
  }

  findBackupFromAircraftSelection(aircraftSelection: AircraftSelection): PreplanAircraftRegister | undefined {
    let allowed: PreplanAircraftRegister[] = [];
    let forbidden: PreplanAircraftRegister[] = [];
    aircraftSelection.allowedIdentities.forEach(i => this.resolveAircraftIdentity(i).forEach(a => allowed.includes(a) || allowed.push(a)));
    aircraftSelection.forbiddenIdentities.forEach(i => this.resolveAircraftIdentity(i).forEach(a => forbidden.includes(a) || forbidden.push(a)));
    return allowed.find(a => !forbidden.includes(a)) || allowed[0];
  }
}
