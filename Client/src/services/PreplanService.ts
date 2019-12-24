import RequestManager from 'src/utils/RequestManager';
import Id from '@core/types/Id';
import PreplanHeaderModel from '@core/models/preplan/PreplanHeaderModel';
import NewPreplanModel from '@core/models/preplan/NewPreplanModel';
import PreplanModel from '@core/models/preplan/PreplanModel';
import DummyAircraftRegisterModel from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';
import PreplanHeaderDataModel from '@core/models/preplan/PreplanHeaderDataModel';
import PreplanDataModel from '@core/models/preplan/PreplanDataModel';

const request = RequestManager.makeRequester('preplan');

export default class PreplanService {
  /**
   * Provides all user related or public preplan headers.
   */
  static async getAllHeaders(): Promise<PreplanHeaderDataModel[]> {
    return await request('get-all-headers');
  }

  /**
   * Creates a new empty preplan and provides its id.
   */
  static async createEmpty(newPreplan: NewPreplanModel): Promise<Id> {
    return await request('create-empty', { newPreplan });
  }

  /**
   * Creates a clone of the specified parent preplan and provides the id of the cloned preplan.
   */
  static async clone(id: Id, newPreplan: NewPreplanModel): Promise<Id> {
    return await request('clone', { id, newPreplan });
  }

  /**
   * Commits a new version of the specified preplan and provides the complete peplan model.
   */
  static async commit(id: Id, description: string): Promise<PreplanDataModel> {
    return await request('commit', { id, description });
  }

  /**
   * Updates the header of a specific preplan and
   * provides the list of all user related or public preplan headers.
   */
  static async editHeader(id: Id, newPreplan: NewPreplanModel): Promise<PreplanHeaderDataModel[]> {
    return await request('edit-header', { id, newPreplan });
  }

  /**
   * Publishes/unpublshes a preplan and provides the list of all user related or public preplan headers.
   */
  static async setPublished(id: Id, published: boolean): Promise<PreplanHeaderDataModel[]> {
    return await request('set-published', { id, published });
  }

  /**
   * Removes a preplan completely and provides the list of all user related or public preplan headers.
   */
  static async remove(id: Id): Promise<PreplanHeaderDataModel[]> {
    return await request('remove', { id });
  }

  /**
   * Provides the complete model of a preplan by its id.
   */
  static async get(id: Id): Promise<PreplanDataModel> {
    return await request('get', { id });
  }

  /**
   * Finalizes some specific preplan and provides the complete peplan model.
   */
  static async accepted(id: Id): Promise<PreplanDataModel> {
    return await request('accepted', { id });
  }

  /**
   * Sets the status of aircraft registers and provides the complete preplan model.
   */
  static async setAircraftRegisters(
    id: Id,
    dummyAircraftRegisters: readonly DummyAircraftRegisterModel[],
    aircraftRegisterOptions: AircraftRegisterOptionsModel
  ): Promise<PreplanDataModel> {
    return await request('set-aircraft-registers', { id, dummyAircraftRegisters, aircraftRegisterOptions });
  }
}
