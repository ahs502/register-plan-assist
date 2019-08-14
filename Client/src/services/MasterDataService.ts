import RequestManager from 'src/utils/RequestManager';
import MasterDataModel from '@core/models/master-data/MasterDataModel';

const request = RequestManager.makeRequester('master-data');

export default class MasterDataService {
  /**
   * Provides all or some of master data collections.
   */
  static async get(...collections: (keyof MasterDataModel)[]) {
    return await request<MasterDataModel>('get', { collections });
  }
}
