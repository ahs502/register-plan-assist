import DummyAircraftRegisterModel from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';
import MasterData, { MasterDataItem, MasterDataItems, AircraftType, AircraftRegisterGroup, AircraftRegister } from '@core/master-data';
import AircraftRegisterOptionsDictionary from './AircraftRegisterOptionsDictionary';
import AircraftIdentity from '@core/master-data/AircraftIdentity';
import AircraftSelection from '@core/master-data/AircraftSelection';
import Preplan from './Preplan';
import Objectionable from 'src/business/constraints/Objectionable';
import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import Checker from 'src/business/constraints/Checker';
import { dataTypes } from 'src/utils/DataType';

/**
 * An enhanced aircraft register capable of presenting both master data and dummy aircraft registers.
 */
export default class PreplanAircraftRegister implements MasterDataItem, Objectionable {
  /**
   * The id of the corresponding aircraft registrer in the master data or
   * a prefix 'dummy-' followed by the id (no.) of the dummy aircraft register
   * within the loaded preplan.
   */
  readonly id: string;

  readonly name: string;
  readonly aircraftType: AircraftType;
  readonly validPeriods: readonly {
    readonly startDate: Date;
    readonly endDate: Date;
  }[];

  /**
   * Whether this enhanced aircraft register is a dummy one or not.
   */
  readonly dummy: boolean;

  readonly options: AircraftRegisterOptionsDictionary[string];

  constructor(
    id: string,
    name: string,
    aircraftType: AircraftType,
    validPeriods: AircraftRegister['validPeriods'],
    dummy: boolean,
    options?: AircraftRegisterOptionsDictionary[string]
  ) {
    this.id = id;
    this.name = name;
    this.aircraftType = aircraftType;
    this.validPeriods = validPeriods;
    this.dummy = dummy;
    this.options = options || AircraftRegisterOptionsDictionary.defaultAircraftRegisterOptions;
  }

  get marker(): string {
    return `aircraft register ${this.name} of type ${this.aircraftType.name}`;
  }
  issueObjection(type: ObjectionType, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string): Objection<PreplanAircraftRegister> {
    return new Objection<PreplanAircraftRegister>(type, this, 4, priority, checker, messageProvider);
  }

  getMinimumGroundTime(transit: boolean, international: boolean, startDate: Date, endDate?: Date, method: 'MAXIMUM' | 'MINIMUM' = 'MAXIMUM'): number {
    return this.aircraftType.getMinimumGroundTime(transit, international, startDate, endDate, method);
  }
}

/**
 * Encapsulates all master data and dummy aircraft registers as a single collection.
 */
export class PreplanAircraftRegisters extends MasterDataItems<PreplanAircraftRegister> {
  readonly preplan: Preplan;

  constructor(dummyAircraftRegisters: readonly DummyAircraftRegisterModel[], aircraftRegisterOptions: AircraftRegisterOptionsModel, preplan: Preplan) {
    const aircraftRegisterOptionsDictionary = new AircraftRegisterOptionsDictionary(aircraftRegisterOptions);
    const masterDataItems = MasterData.all.aircraftRegisters.items
      // .filter(a => a.validPeriods.some(p => Date.intervalOverlaps(p.startDate, p.endDate, preplan.startDate, preplan.endDate))) // Keep it commented, it distrupts loading flight requirements with invalid aircraft registers.
      .map(a => new PreplanAircraftRegister(a.id, a.name, a.aircraftType, a.validPeriods, false, aircraftRegisterOptionsDictionary[a.id]));
    const dummyItems = dummyAircraftRegisters
      ? dummyAircraftRegisters.map(
          a =>
            new PreplanAircraftRegister(
              a.id,
              dataTypes.name.convertModelToBusiness(a.name),
              dataTypes.aircraftType.convertModelToBusiness(a.aircraftTypeId),
              [{ startDate: new Date(1970, 1, 1), endDate: new Date(2070, 1, 1) }],
              true,
              aircraftRegisterOptionsDictionary[a.id]
            )
        )
      : [];
    super([...masterDataItems, ...dummyItems]);
    this.preplan = preplan;
  }

  resolveAircraftIdentity(aircraftIdentity: AircraftIdentity): readonly PreplanAircraftRegister[] {
    switch (aircraftIdentity.type) {
      case 'REGISTER':
        return [this.id[aircraftIdentity.entity.id]];
      case 'TYPE':
        return this.items.filter(r => r.aircraftType.id === aircraftIdentity.entity.id);
      case 'TYPE_EXISTING':
        return this.items.filter(r => r.aircraftType.id === aircraftIdentity.entity.id && !r.dummy);
      case 'TYPE_DUMMY':
        return this.items.filter(r => r.aircraftType.id === aircraftIdentity.entity.id && r.dummy);
      case 'GROUP':
        return (aircraftIdentity.entity as AircraftRegisterGroup).aircraftRegisters.map(r => this.id[r.id]);
      default:
        throw 'Invalid aircraft identity type.';
    }
  }
  resolveAircraftSelection(aircraftSelection: AircraftSelection): readonly PreplanAircraftRegister[] {
    const result: PreplanAircraftRegister[] = [];
    aircraftSelection.includedIdentities.forEach(i => this.resolveAircraftIdentity(i).forEach(r => result.includes(r) || result.push(r)));
    aircraftSelection.excludedIdentities.forEach(i => this.resolveAircraftIdentity(i).forEach(r => result.includes(r) && result.remove(r)));
    return result;
  }
}
