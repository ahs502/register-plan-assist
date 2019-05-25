import MasterDataItem, { MasterDataItems, MasterDataItemModel } from './MasterDataItem';
import AircraftRegister from './AircraftRegister';
import MasterData from '.';

export interface AircraftGroupModel extends MasterDataItemModel {
  aircraftRegisterIds: string[];
}

export default class AircraftGroup extends MasterDataItem implements AircraftGroupModel {
  readonly aircraftRegisterIds: string[];

  constructor(raw: AircraftGroupModel) {
    super(raw);
    this.aircraftRegisterIds = raw.aircraftRegisterIds;
  }

  getAircraftRegisters(): AircraftRegister[] {
    return this.aircraftRegisterIds.map(id => MasterData.all.aircraftRegisters.id[id]);
  }
}

export class AircraftGroups extends MasterDataItems<AircraftGroup> {
  static parse(raw: AircraftGroupModel[]): AircraftGroups | undefined {
    if (!raw) return undefined;
    return new AircraftGroups(raw.map(x => new AircraftGroup(x)));
  }
}
