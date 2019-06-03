import apiRequest from '../utils/apiRequest';
import { PreplanHeaderModel, PreplanModel } from '../business/Preplan';
import { FlightRequirementModel } from '../business/FlightRequirement';
import { DummyAircraftRegisterModel, AircraftRegisterOptionsDictionary } from '../business/AircraftRegister';
import AutoArrangerOptions from '../business/AutoArrangerOptions';

const request = apiRequest.bind(null, 'preplan');

export default class PreplanService {
  /**
   * Provides all user related or public preplan headers.
   */
  static async getAllHeaders(): Promise<ReadonlyArray<Readonly<PreplanHeaderModel>>> {
    return await request('get-all-headers');
  }

  /**
   * Creates a new empty preplan and provides its id.
   */
  static async createEmpty(name: string, startDate: Date, endDate: Date): Promise<string> {
    return await request('create-empty', { name, startDate, endDate });
  }

  /**
   * Creates a clone of the specified parent preplan and provides the id of the cloned preplan.
   */
  static async clone(id: string, name: string, startDate: Date, endDate: Date): Promise<string> {
    return await request('clone', { id, name, startDate, endDate });
  }

  /**
   * Provides the complete model of a preplan by its id.
   */
  static async get(id: string): Promise<Readonly<PreplanModel>> {
    return await request('get', { id });
  }

  /**
   * Updates the header of a specific preplan and
   * provides the list of all user related or public preplan headers.
   */
  static async editHeader(id: string, name: string, published: boolean, startDate: Date, endDate: Date): Promise<ReadonlyArray<Readonly<PreplanHeaderModel>>> {
    return await request('edit-header', { id, name, published, startDate, endDate });
  }

  /**
   * Finalizes some specific preplan and provides its complete model.
   */
  static async finalize(id: string): Promise<Readonly<PreplanModel>> {
    return await request('finalize', { id });
  }

  /**
   * Removes a preplan completely and provides the success status of that operation.
   */
  static async remove(id: string): Promise<boolean> {
    return await request('remove', { id });
  }

  /**
   * Updates the auto-arranger options for some specified preplan and provides the same auto-arranger options.
   */
  static async updateAutoArrangerOptions(id: string, autoArrangerOptions: Readonly<AutoArrangerOptions>): Promise<Readonly<AutoArrangerOptions>> {
    return await request('update-auto-arranger-options', { id, autoArrangerOptions });
  }

  /**
   * Adds/edits (according to the given id in model) some dummy aircraft register for
   * some specified preplan and provides the complete data model of that preplan.
   */
  static async addOrEditDummyAircraftRegister(id: string, dummyAircraftRegister: Readonly<DummyAircraftRegisterModel>): Promise<Readonly<PreplanModel>> {
    return await request('add-or-edit-dummy-aircraft-register', { id, dummyAircraftRegister });
  }

  /**
   * Removes some dummy aircraft register and provides the complete data model of its preplan.
   */
  static async removeDummyAircraftRegister(dummyAircraftRegisterId: string): Promise<Readonly<PreplanModel>> {
    return await request('remove-dummy-aircraft-register', { dummyAircraftRegisterId });
  }

  /**
   * Updates the aircraft register options dictionary for some specified preplan and provides the complete data model of that preplan.
   */
  static async updateAircraftRegisterOptionsDictionary(
    id: string,
    aircraftRegisterOptionsDictionary: Readonly<AircraftRegisterOptionsDictionary>
  ): Promise<Readonly<PreplanModel>> {
    return await request('update-aircraft-register-options-dictionary', { id, aircraftRegisterOptionsDictionary });
  }

  /**
   * Adds/edits (according to the given id) some flight requirement including
   * its day flight requirements for some specified preplan and provides
   * the full new data model of the same flight requirement, including the id fields in case of adding.
   */
  static async addOrEditFlightRequirement(id: string, flightRequirement: Readonly<FlightRequirementModel>): Promise<Readonly<FlightRequirementModel>> {
    return await request('add-or-edit-flight-requirement', { id, flightRequirement });
  }

  /**
   * Removes some flight requirement including its day flight requirements and
   * provides the success statuc of that operation.
   */
  static async removeFlightRequirement(flightRequirementId: string): Promise<boolean> {
    return await request('remove-flight-requirement', { flightRequirementId });
  }
}
