import MasterDataItemEntity from './_MasterDataItemEntity';

export default interface AircraftGroupEntity extends MasterDataItemEntity {
  readonly aircraftRegisterIds: readonly string[];
}
