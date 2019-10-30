import MasterDataItemModel from './MasterDataItemModel';
import Id from '@core/types/Id';

export default interface AircraftRegisterGroupModel extends MasterDataItemModel {
  readonly aircraftRegisterIds: readonly Id[];
}
