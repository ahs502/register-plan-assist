import AircraftRegisterModel from '../models/master-data/AircraftRegisterModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import AircraftType from './AircraftType';
import MasterData from './MasterData';

export default class AircraftRegister extends MasterDataItem {
  readonly aircraftTypeId: string;

  constructor(raw: AircraftRegisterModel) {
    super(raw);
    this.aircraftTypeId = raw.aircraftTypeId;
  }

  getAircraftType(): AircraftType {
    return MasterData.all.aircraftTypes.id[this.aircraftTypeId];
  }
  getMinimumGroundTime(date: Date, transit: boolean, international: boolean): number {
    return this.getAircraftType().getMinimumGroundTime(date, transit, international);
  }
}

export class AircraftRegisters extends MasterDataItems<AircraftRegister> {
  static parse(raw?: readonly AircraftRegisterModel[]): AircraftRegisters | undefined {
    if (!raw) return undefined;
    return new AircraftRegisters(raw.map(x => new AircraftRegister(x)));
  }
}
