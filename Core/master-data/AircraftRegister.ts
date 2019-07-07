import AircraftRegisterModel from '@core/models/master-data/AircraftRegisterModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import AircraftType from './AircraftType';
import MasterData from './MasterData';

export default class AircraftRegister extends MasterDataItem {
  private readonly aircraftTypeId: string;

  constructor(raw: AircraftRegisterModel) {
    super(raw);
    this.aircraftTypeId = raw.aircraftTypeId;
  }

  get aircraftType(): AircraftType {
    return MasterData.all.aircraftTypes.id[this.aircraftTypeId];
  }
  getMinimumGroundTime(date: Date, transit: boolean, international: boolean): number {
    return this.aircraftType.getMinimumGroundTime(date, transit, international);
  }
}

export class AircraftRegisters extends MasterDataItems<AircraftRegister> {
  static parse(raw?: readonly AircraftRegisterModel[]): AircraftRegisters | undefined {
    if (!raw) return undefined;
    return new AircraftRegisters(raw.map(x => new AircraftRegister(x)));
  }
}
