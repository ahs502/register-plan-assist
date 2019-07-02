import AircraftGroupModel from '../models/master-data/AircraftGroupModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import AircraftRegister from './AircraftRegister';
import MasterData from './MasterData';

export default class AircraftGroup extends MasterDataItem {
  readonly aircraftRegisterIds: readonly string[];

  constructor(raw: AircraftGroupModel) {
    super(raw);
    this.aircraftRegisterIds = raw.aircraftRegisterIds;
  }

  getAircraftRegisters(): readonly AircraftRegister[] {
    return this.aircraftRegisterIds.map(id => MasterData.all.aircraftRegisters.id[id]);
  }
}

export class AircraftGroups extends MasterDataItems<AircraftGroup> {
  static parse(raw?: readonly AircraftGroupModel[]): AircraftGroups | undefined {
    if (!raw) return undefined;
    return new AircraftGroups(raw.map(x => new AircraftGroup(x)));
  }
}
