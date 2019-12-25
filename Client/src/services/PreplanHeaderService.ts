import RequestManager from 'src/utils/RequestManager';
import Id from '@core/types/Id';
import PreplanHeaderDataModel from '@core/models/preplan/PreplanHeaderDataModel';
import NewPreplanHeaderModel from '@core/models/preplan/NewPreplanHeaderModel';
import ClonePreplanHeaderModel from '@core/models/preplan/ClonePreplanHeaderModel';
import EditPreplanHeaderModel from '@core/models/preplan/EditPreplanHeaderModel';

const request = RequestManager.makeRequester('preplan-header');

export default class PreplanHeaderService {
  /**
   * Provides all user related or public preplan data headers.
   */
  static async getAll(): Promise<PreplanHeaderDataModel[]> {
    return await request('get-all');
  }

  /**
   * Creates a new empty preplan with header and provides its preplan id.
   */
  static async createEmpty(newPreplanHeader: NewPreplanHeaderModel): Promise<Id> {
    return await request('create-empty', { newPreplanHeader });
  }

  /**
   * Creates a clone of the specified preplan with header and provides the id of the cloned preplan.
   */
  static async clone(clonePreplanHeader: ClonePreplanHeaderModel): Promise<Id> {
    return await request('clone', { clonePreplanHeader });
  }

  /**
   * Updates the preplan header and provides the list of all user related or public preplan data headers.
   */
  static async edit(editPreplanHeader: EditPreplanHeaderModel): Promise<PreplanHeaderDataModel[]> {
    return await request('edit', { editPreplanHeader });
  }

  /**
   * Publishes/unpublishes a preplan header and provides the list of all user related or public preplan data headers.
   */
  static async setPublished(id: Id, published: boolean): Promise<PreplanHeaderDataModel[]> {
    return await request('set-published', { id, published });
  }

  /**
   * Removes a preplan header completely and provides the list of all user related or public preplan data headers.
   */
  static async remove(id: Id): Promise<PreplanHeaderDataModel[]> {
    return await request('remove', { id });
  }
}
