import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import AircraftType from './AircraftType';
import masterData from './MasterData';

export default class AircraftRegister implements MasterDataItem {
  id: string;
  name: string;

  aircraftTypeId: string;

  constructor(raw: any) {
    this.id = String(raw['id']);
    this.name = String(raw['name']);

    this.aircraftTypeId = String(raw['aircraftTypeId']);
  }

  getAircraftType(): AircraftType {
    return masterData.aircraftTypes.id[this.aircraftTypeId];
  }

  getMinimumGroundTime(date: Date, isTransit: boolean, isInternational: boolean): number {
    return this.getAircraftType().getMinimumGroundTime(date, isTransit, isInternational);
  }
}

export class AircraftRegisters extends MasterDataItems<AircraftRegister> {}
