import AircraftRegisterModel from '@core/models/master-data/AircraftRegisterModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import AircraftType, { AircraftTypes } from './AircraftType';

export default class AircraftRegister extends MasterDataItem {
  readonly aircraftType: AircraftType;
  /** Concatinated as much as possible. */ readonly validPeriods: readonly {
    readonly startDate: Date;
    readonly endDate: Date;
  }[];

  constructor(raw: AircraftRegisterModel, aircraftTypes: AircraftTypes) {
    super(raw);
    this.aircraftType = aircraftTypes.id[raw.aircraftTypeId];
    this.validPeriods = raw.validPeriods.map(p => ({
      startDate: new Date(p.startDate),
      endDate: new Date(p.endDate)
    }));
  }

  getMinimumGroundTime(transit: boolean, international: boolean, startDate: Date, endDate?: Date, method: 'MAXIMUM' | 'MINIMUM' = 'MAXIMUM'): number {
    return this.aircraftType.getMinimumGroundTime(transit, international, startDate, endDate, method);
  }
}

export class AircraftRegisters extends MasterDataItems<AircraftRegister> {
  static parse(aircraftTypes: AircraftTypes, raw?: readonly AircraftRegisterModel[]): AircraftRegisters | undefined {
    if (!raw) return undefined;
    return new AircraftRegisters(raw.map(x => new AircraftRegister(x, aircraftTypes)));
  }
}
