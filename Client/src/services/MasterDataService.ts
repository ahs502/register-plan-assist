import apiRequest, { apiRequestMaker } from 'src/utils/apiRequest';
import MasterDataModel from '@core/models/master-data/MasterDataModel';
import AircraftGroupModel from '@core/models/master-data/AircraftGroupModel';
import ConstraintModel from '@core/models/master-data/ConstraintModel';
import ServerResult from '@core/types/ServerResult';

const request = apiRequestMaker('master-data');

export default class MasterDataService {
  /**
   * Provides all or some of master data collections.
   */
  static async get(...collections: (keyof MasterDataModel)[]) {
    return await request<MasterDataModel>('get', { collections });
  }
}
