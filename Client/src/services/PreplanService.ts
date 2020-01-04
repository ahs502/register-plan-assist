import RequestManager from 'src/utils/RequestManager';
import Id from '@core/types/Id';
import DummyAircraftRegisterModel from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';
import PreplanDataModel from '@core/models/preplan/PreplanDataModel';

const request = RequestManager.makeRequester('preplan');

export default class PreplanService {
  /**
   * Commits a new version of the specified preplan and provides the peplan data model.
   */
  static async commit(id: Id, description: string): Promise<PreplanDataModel> {
    return await request('commit', { id, description });
  }

  /**
   * Provides the preplan data model by its id.
   */
  static async get(id: Id): Promise<PreplanDataModel> {
    return await request('get', { id });
  }

  /**
   * Accepts a preplan header and provides the peplan data model.
   */
  static async accept(id: Id): Promise<PreplanDataModel> {
    return await request('accept', { id });
  }

  /**
   * Removes a certain preplan version and provides the peplan data model.
   */
  static async remove(id: Id, currentPreplanId: Id): Promise<PreplanDataModel> {
    return await request('remove', { id, currentPreplanId });
  }

  /**
   * Sets the status of aircraft registers and provides the preplan data model.
   */
  static async setAircraftRegisters(
    id: Id,
    dummyAircraftRegisters: readonly DummyAircraftRegisterModel[],
    aircraftRegisterOptions: AircraftRegisterOptionsModel
  ): Promise<PreplanDataModel> {
    return await request('set-aircraft-registers', { id, dummyAircraftRegisters, aircraftRegisterOptions });
  }
}
