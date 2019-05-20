import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import AircraftRegister from './AircraftRegister';
import masterData from '.';

export default class AircraftGroup implements MasterDataItem {
  id: string;
  name: string;

  aircraftRegisterIds: string[];

  constructor(id: string, name: string, aircraftRegisterIds: string[]) {
    this.id = id;
    this.name = name;

    this.aircraftRegisterIds = aircraftRegisterIds;
  }

  static parse(raw: any): AircraftGroup {
    return new AircraftGroup(String(raw['id']), String(raw['name']), <Array<string>>raw['aircraftRegisterIds']);
  }

  getAircraftRegisters(): AircraftRegister[] {
    return this.aircraftRegisterIds.map(id => masterData.aircraftRegisters.id[id]);
  }
}

export class AircraftGroups extends MasterDataItems<AircraftGroup> {
  static parse(raw: any): AircraftGroups | undefined {
    if (!raw) return undefined;
    return new AircraftGroups((<Array<any>>raw).map(AircraftGroup.parse));
  }
}
