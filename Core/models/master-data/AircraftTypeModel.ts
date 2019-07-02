import MasterDataItemModel from './MasterDataItemModel';

export default interface AircraftTypeModel extends MasterDataItemModel {
  readonly displayOrder: number;
  readonly turnrounds: readonly {
    readonly startDate: string;
    readonly endDate: string;
    readonly minimumGroundTime: {
      readonly departureDomestic: number;
      readonly departureInternational: number;
      readonly transitDomestic: number;
      readonly transitInternational: number;
    };
  }[];
}
