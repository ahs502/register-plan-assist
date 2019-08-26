import RequestManager from 'src/utils/RequestManager';
import PreplanModel, { PreplanHeaderModel } from '@core/models/PreplanModel';
import FlightRequirementModel from '@core/models/flights/FlightRequirementModel';
import NewPreplanModel from '@core/models/NewPreplanModel';
import EditPreplanModel from '@core/models/EditPreplanModel';
import DummyAircraftRegisterModel from '@core/models/DummyAircraftRegisterModel';
import { AircraftRegisterOptionsDictionaryModel } from '@core/models/AircraftRegisterOptionsModel';

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

  /**
   * Adds a new flight requirement and provides it again including its new id.
   */
  static async addFlightRequirement(id: string, flightRequirement: FlightRequirementModel) {
    return await request<FlightRequirementModel>('add-flight-requirement', { id, flightRequirement });
  }

  /**
   * Removes a flight requirement.
   */
  static async removeFlightRequirement(flightRequirementId: string) {
    return await request<void>('remove-flight-requirement', { flightRequirementId });
  }

  /**
   * Edits all the given flight requirements and provides them with their new values.
   */
  static async editFlightRequirements(flightRequirements: readonly FlightRequirementModel[]) {
    return await request<FlightRequirementModel[]>('edit-flight-requirements', { flightRequirements });
  }

  /**
   * Sets a flight requirement included/excluded status and provides it again with new value.
   */
  static async setFlightRequirementIncluded(flightRequirementId: string, included: boolean) {
    return await request<FlightRequirementModel>('set-flight-requirement-included', { flightRequirementId, included });
  }

  /**
   * Sets the status of aircraft registers.
   */
  static async setAircraftRegisters(
    id: string,
    dummyAircraftRegisters: readonly DummyAircraftRegisterModel[],
    aircraftRegisterOptionsDictionary: AircraftRegisterOptionsDictionaryModel
  ) {
    return await request<void>('set-aircraft-registers', { id, dummyAircraftRegisters, aircraftRegisterOptionsDictionary });
  }
}
