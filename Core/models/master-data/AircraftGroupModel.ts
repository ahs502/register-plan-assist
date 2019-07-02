import MasterDataItemModel from './MasterDataItemModel';

export default interface AircraftGroupModel extends MasterDataItemModel {
  readonly aircraftRegisterIds: readonly string[];
}
