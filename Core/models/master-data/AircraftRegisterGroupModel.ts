import MasterDataItemModel from './MasterDataItemModel';

export default interface AircraftRegisterGroupModel extends MasterDataItemModel {
  readonly aircraftRegisterIds: readonly string[];
}
