import RequestManager from 'src/utils/RequestManager';
import PreplanModel, { PreplanHeaderModel } from '@core/models/PreplanModel';
import AutoArrangerOptions from '@core/models/AutoArrangerOptionsModel';
import FlightRequirementModel from '@core/models/flights/FlightRequirementModel';
import ServerResult from '@core/types/ServerResult';
import NewPreplanModel from '@core/models/NewPreplanModel';
import EditPreplanModel from '@core/models/EditPreplanModel';

const request = RequestManager.makeRequester('preplan');

export default class PreplanService {
  /**
   * Provides all user related or public preplan headers.
   */
  static async getAllHeaders() {
    return await request<PreplanHeaderModel[]>('get-all-headers');
  }

  /**
   * Creates a new empty preplan and provides its id.
   */
  static async createEmpty(newPreplan: NewPreplanModel) {
    return await request<string>('create-empty', newPreplan);
  }

  /**
   * Creates a clone of the specified parent preplan and provides the id of the cloned preplan.
   */
  static async clone(id: string, newPreplan: NewPreplanModel) {
    return await request<string>('clone', { id, newPreplan });
  }

  /**
   * Updates the header of a specific preplan and
   * provides the list of all user related or public preplan headers.
   */
  static async editHeader(editPreplan: EditPreplanModel) {
    return await request<PreplanHeaderModel[]>('edit-header', editPreplan);
  }

  /**
   * Publishes/unpublshes a preplan and provides the list of all user related or public preplan headers.
   */
  static async setPublished(id: string, published: boolean) {
    return await request<PreplanHeaderModel[]>('set-published', { id, published });
  }

  /**
   * Removes a preplan completely and provides the list of all user related or public preplan headers.
   */
  static async remove(id: string) {
    return await request<PreplanHeaderModel[]>('remove', { id });
  }

  /**
   * Provides the complete model of a preplan by its id.
   */
  static async get(id: string) {
    return await request<PreplanModel>('get', { id });
  }

  /**
   * Finalizes some specific preplan and provides its complete model.
   */
  static async finalize(id: string) {
    return await request<PreplanModel>('finalize', { id });
  }

  // /**
  //  * Updates the auto-arranger options for some specified preplan and provides the same auto-arranger options.
  //  */
  // static async updateAutoArrangerOptions(id: string, autoArrangerOptions: Readonly<AutoArrangerOptions>): Promise<ServerResult<Readonly<AutoArrangerOptions>>> {
  //   return await request('update-auto-arranger-options', { id, autoArrangerOptions });
  // }

  // /**
  //  * Adds/edits (according to the given id in model) some dummy aircraft register for
  //  * some specified preplan and provides the complete data model of that preplan.
  //  */
  // static async addOrEditDummyAircraftRegister(id: string, dummyAircraftRegister: Readonly<DummyAircraftRegisterModel>): Promise<ServerResult<Readonly<PreplanModel>>> {
  //   return await request('add-or-edit-dummy-aircraft-register', { id, dummyAircraftRegister });
  // }

  // /**
  //  * Removes some dummy aircraft register and provides the complete data model of its preplan.
  //  */
  // static async removeDummyAircraftRegister(dummyAircraftRegisterId: string): Promise<ServerResult<Readonly<PreplanModel>>> {
  //   return await request('remove-dummy-aircraft-register', { dummyAircraftRegisterId });
  // }

  // /**
  //  * Updates the aircraft register options dictionary for some specified preplan and provides the complete data model of that preplan.
  //  */
  // static async updateAircraftRegisterOptionsDictionary(
  //   id: string,
  //   aircraftRegisterOptionsDictionary: Readonly<AircraftRegisterOptionsDictionary>
  // ): Promise<ServerResult<Readonly<PreplanModel>>> {
  //   return await request('update-aircraft-register-options-dictionary', { id, aircraftRegisterOptionsDictionary });
  // }

  /**
   * Adds/edits (according to the given id) some flight requirement including
   * its day flight requirements for some specified preplan and provides
   * the full new data model of the same flight requirement, including the id fields in case of adding.
   */
  static async addOrEditFlightRequirement(id: string, flightRequirement: Readonly<FlightRequirementModel>): Promise<ServerResult<Readonly<FlightRequirementModel>>> {
    return await request('add-or-edit-flight-requirement', { id, flightRequirement });
  }

  /**
   * Removes some flight requirement including its day flight requirements and
   * provides the success statuc of that operation.
   */
  static async removeFlightRequirement(flightRequirementId: string): Promise<ServerResult<boolean>> {
    return await request('remove-flight-requirement', { flightRequirementId });
  }
}
