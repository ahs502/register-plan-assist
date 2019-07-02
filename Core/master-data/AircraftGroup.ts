import AircraftGroupModel from '../models/master-data/AircraftGroupModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import AircraftRegister from './AircraftRegister';
import MasterData from './MasterData';

export default class AircraftGroup extends MasterDataItem {
  private readonly aircraftRegisterIds: readonly string[];

  constructor(raw: AircraftGroupModel) {
    super(raw);
    this.aircraftRegisterIds = raw.aircraftRegisterIds;
  }

  private _aircraftRegisters?: readonly AircraftRegister[];
  get aircraftRegisters(): readonly AircraftRegister[] {
    if (this._aircraftRegisters) return this._aircraftRegisters;
    return (this._aircraftRegisters = this.aircraftRegisterIds.map(id => MasterData.all.aircraftRegisters.id[id]));
  }
}

export class AircraftGroups extends MasterDataItems<AircraftGroup> {
  static parse(raw?: readonly AircraftGroupModel[]): AircraftGroups | undefined {
    if (!raw) return undefined;
    return new AircraftGroups(raw.map(x => new AircraftGroup(x)));
  }
}
