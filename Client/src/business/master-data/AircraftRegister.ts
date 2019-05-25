import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import AircraftType from './AircraftType';
import MasterData from '.';

export interface AircraftRegisterModel extends MasterDataItem {
  aircraftTypeId: string;
}

export default class AircraftRegister implements AircraftRegisterModel {
  readonly id: string;
  readonly name: string;
  readonly aircraftTypeId: string;

  constructor(id: string, name: string, aircraftTypeId: string) {
    this.id = id;
    this.name = name;
    this.aircraftTypeId = aircraftTypeId;
  }

  static parse(raw: AircraftRegisterModel): AircraftRegister {
    return new AircraftRegister(raw.id, raw.name, raw.aircraftTypeId);
  }

  getAircraftType(): AircraftType {
    return MasterData.all.aircraftTypes.id[this.aircraftTypeId];
  }

  getMinimumGroundTime(date: Date, transit: boolean, international: boolean): number {
    return this.getAircraftType().getMinimumGroundTime(date, transit, international);
  }
}

export class AircraftRegisters extends MasterDataItems<AircraftRegister> {
  static parse(raw: AircraftRegisterModel[]): AircraftRegisters | undefined {
    if (!raw) return undefined;
    return new AircraftRegisters(raw.map(AircraftRegister.parse));
  }
}
