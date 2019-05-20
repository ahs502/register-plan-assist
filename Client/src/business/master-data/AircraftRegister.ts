import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import AircraftType from './AircraftType';
import masterData from '.';

export default class AircraftRegister implements MasterDataItem {
  id: string;
  name: string;

  aircraftTypeId: string;

  constructor(id: string, name: string, aircraftTypeId: string) {
    this.id = id;
    this.name = name;

    this.aircraftTypeId = aircraftTypeId;
  }

  static parse(raw: any): AircraftRegister {
    return new AircraftRegister(String(raw['id']), String(raw['name']), String(raw['aircraftTypeId']));
  }

  getAircraftType(): AircraftType {
    return masterData.aircraftTypes.id[this.aircraftTypeId];
  }

  getMinimumGroundTime(date: Date, isTransit: boolean, isInternational: boolean): number {
    return this.getAircraftType().getMinimumGroundTime(date, isTransit, isInternational);
  }
}

export class AircraftRegisters extends MasterDataItems<AircraftRegister> {
  static parse(raw: any): AircraftRegisters | undefined {
    if (!raw) return undefined;
    return new AircraftRegisters((<Array<any>>raw).map(AircraftRegister.parse));
  }
}
