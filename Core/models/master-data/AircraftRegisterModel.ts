import MasterDataItemModel from './MasterDataItemModel';

export default interface AircraftRegisterModel extends MasterDataItemModel {
  readonly aircraftTypeId: string;
}
