import apiRequest from 'src/utils/apiRequest';
import MasterDataModel from '@core/models/master-data/MasterDataModel';
import AircraftGroupModel from '@core/models/master-data/AircraftGroupModel';
import ConstraintModel from '@core/models/master-data/ConstraintModel';

const request = apiRequest.bind(null, 'master-data');

export default class MasterDataService {
  /**
   * Provides all or some of master data collections.
   */
  static async getAll(collectionSelector?: { readonly [collectionName in keyof MasterDataModel]?: true }): Promise<Partial<MasterDataModel>> {
    return await request('get-all', { collectionSelector });
  }
}
