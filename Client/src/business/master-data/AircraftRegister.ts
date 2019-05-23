import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import AircraftType from './AircraftType';
import MasterData from '.';

export default class AircraftRegister implements MasterDataItem {
  readonly id: string;
  readonly name: string;
  readonly aircraftTypeId: string;

  constructor(id: string, name: string, aircraftTypeId: string) {
    this.id = id;
    this.name = name;
    this.aircraftTypeId = aircraftTypeId;
  }

  static parse(raw: any): AircraftRegister {
    return new AircraftRegister(String(raw['id']), String(raw['name']), String(raw['aircraftTypeId']));
  }

  getAircraftType(): AircraftType {
    return MasterData.all.aircraftTypes.id[this.aircraftTypeId];
  }

  getMinimumGroundTime(date: Date, transit: boolean, international: boolean): number {
    return this.getAircraftType().getMinimumGroundTime(date, transit, international);
  }
}

export class AircraftRegisters extends MasterDataItems<AircraftRegister> {
  static parse(raw: any): AircraftRegisters | undefined {
    if (!raw) return undefined;
    return new AircraftRegisters((<Array<any>>raw).map(AircraftRegister.parse));
  }
}
