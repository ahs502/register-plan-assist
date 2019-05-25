import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import AircraftRegister from './AircraftRegister';
import MasterData from '.';

export interface AircraftGroupModel extends MasterDataItem {
  aircraftRegisterIds: string[];
}

export default class AircraftGroup implements AircraftGroupModel {
  readonly id: string;
  readonly name: string;
  readonly aircraftRegisterIds: string[];

  constructor(id: string, name: string, aircraftRegisterIds: string[]) {
    this.id = id;
    this.name = name;
    this.aircraftRegisterIds = aircraftRegisterIds;
  }

  static parse(raw: AircraftGroupModel): AircraftGroup {
    return new AircraftGroup(raw.id, raw.name, raw.aircraftRegisterIds);
  }

  getAircraftRegisters(): AircraftRegister[] {
    return this.aircraftRegisterIds.map(id => MasterData.all.aircraftRegisters.id[id]);
  }
}

export class AircraftGroups extends MasterDataItems<AircraftGroup> {
  static parse(raw: AircraftGroupModel[]): AircraftGroups | undefined {
    if (!raw) return undefined;
    return new AircraftGroups(raw.map(AircraftGroup.parse));
  }
}
