import AircraftRegisterGroupModel from '@core/models/master-data/AircraftRegisterGroupModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import AircraftRegister, { AircraftRegisters } from './AircraftRegister';

export default class AircraftRegisterGroup extends MasterDataItem {
  readonly aircraftRegisters: readonly AircraftRegister[];

  constructor(raw: AircraftRegisterGroupModel, aircraftRegisters: AircraftRegisters) {
    super(raw);
    this.aircraftRegisters = raw.aircraftRegisterIds.map(id => aircraftRegisters.id[id]);
  }
}

export class AircraftRegisterGroups extends MasterDataItems<AircraftRegisterGroup> {
  static parse(aircraftRegisters: AircraftRegisters, raw?: readonly AircraftRegisterGroupModel[]): AircraftRegisterGroups | undefined {
    if (!raw) return undefined;
    return new AircraftRegisterGroups(raw.map(x => new AircraftRegisterGroup(x, aircraftRegisters)));
  }
}
