import AircraftGroupModel from '@core/models/master-data/AircraftGroupModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import AircraftRegister, { AircraftRegisters } from './AircraftRegister';

export default class AircraftGroup extends MasterDataItem {
  readonly aircraftRegisters: readonly AircraftRegister[];

  constructor(raw: AircraftGroupModel, aircraftRegisters: AircraftRegisters) {
    super(raw);
    this.aircraftRegisters = raw.aircraftRegisterIds.map(id => aircraftRegisters.id[id]);
  }
}

export class AircraftGroups extends MasterDataItems<AircraftGroup> {
  static parse(aircraftRegisters: AircraftRegisters, raw?: readonly AircraftGroupModel[]): AircraftGroups | undefined {
    if (!raw) return undefined;
    return new AircraftGroups(raw.map(x => new AircraftGroup(x, aircraftRegisters)));
  }
}
