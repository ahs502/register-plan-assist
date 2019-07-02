import MasterDataItemEntity from './MasterDataItemEntity';

export default interface AircraftGroupEntity extends MasterDataItemEntity {
  readonly aircraftRegisterIds: readonly string[];
}
