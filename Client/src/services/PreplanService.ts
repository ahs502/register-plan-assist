import RequestManager from 'src/utils/RequestManager';
import Id from '@core/types/Id';
import PreplanHeaderModel from '@core/models/preplan/PreplanHeaderModel';
import NewPreplanModel from '@core/models/preplan/NewPreplanModel';
import PreplanModel from '@core/models/preplan/PreplanModel';
import NewFlightRequirementModel from '@core/models/flight-requirement/NewFlightRequirementModel';
import DummyAircraftRegisterModel from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';

const request = RequestManager.makeRequester('preplan');

export default class PreplanService {
  /**
   * Provides all user related or public preplan headers.
   */
  static async getAllHeaders(): Promise<PreplanHeaderModel[]> {
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
   * Updates the header of a specific preplan and
   * provides the list of all user related or public preplan headers.
   */
  static async editHeader(id: Id, newPreplan: NewPreplanModel): Promise<PreplanHeaderModel[]> {
    return await request('edit-header', { id, newPreplan });
  }

  /**
   * Publishes/unpublshes a preplan and provides the list of all user related or public preplan headers.
   */
  static async setPublished(id: Id, published: boolean): Promise<PreplanHeaderModel[]> {
    return await request('set-published', { id, published });
  }

  /**
   * Removes a preplan completely and provides the list of all user related or public preplan headers.
   */
  static async remove(id: Id): Promise<PreplanHeaderModel[]> {
    return await request('remove', { id });
  }

  /**
   * Provides the complete model of a preplan by its id.
   */
  static async get(id: Id): Promise<PreplanModel> {
    return await request('get', { id });
  }

  /**
   * Finalizes some specific preplan and provides its complete model.
   */
  static async finalize(id: Id): Promise<PreplanModel> {
    return await request('finalize', { id });
  }

  /**
   * Adds a new flight requirement and provides it again including its new id.
   */
  static async addFlightRequirement(id: Id, newFlightRequirement: NewFlightRequirementModel): Promise<NewFlightRequirementModel> {
    return await request('add-flight-requirement', { id, newFlightRequirement });
  }

  /**
   * Removes a flight requirement.
   */
  static async removeFlightRequirement(id: Id, flightRequirementId: Id): Promise<void> {
    return await request('remove-flight-requirement', { id, flightRequirementId });
  }

  /**
   * Edits all the given flight requirements and provides them with their new values.
   */
  static async editFlightRequirements(id: Id, flightRequirements: readonly NewFlightRequirementModel[]): Promise<NewFlightRequirementModel[]> {
    return await request('edit-flight-requirements', { id, flightRequirements });
  }

  /**
   * Sets the status of aircraft registers.
   */
  static async setAircraftRegisters(id: Id, dummyAircraftRegisters: readonly DummyAircraftRegisterModel[], aircraftRegisterOptions: AircraftRegisterOptionsModel): Promise<void> {
    return await request('set-aircraft-registers', { id, dummyAircraftRegisters, aircraftRegisterOptions });
  }
}
