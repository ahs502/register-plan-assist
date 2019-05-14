import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import AircraftRegister from './AircraftRegister';
import masterData from '.';

export default class AircraftGroup implements MasterDataItem {
  id: string;
  name: string;

  aircraftRegisterIds: string[];

  constructor(raw: any) {
    this.id = String(raw['id']);
    this.name = String(raw['name']);

    this.aircraftRegisterIds = <Array<string>>raw['aircraftRegisterIds'];
  }

  getAircraftRegisters(): AircraftRegister[] {
    return this.aircraftRegisterIds.map(id => masterData.aircraftRegisters.id[id]);
  }
}

export class AircraftGroups extends MasterDataItems<AircraftGroup> {}
