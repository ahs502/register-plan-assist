import { apiRequest } from '../utils/api';

const service = 'PreplanService';
export default class PreplanService {
  /**
   * Creates a new empty preplan and provides its id.
   */
  static async createEmptyPreplan(name: string, startDate: Date, endDate: Date): Promise<string> {
    return await apiRequest(service, 'create-empty-preplan', {
      name,
      startDate: startDate.toJSON(),
      endDate: endDate.toJSON()
    });
  }

  /**
   * Creates a clone of the specified parent preplan and provides its id.
   */
  static async clonePreplan(parentPreplanId: string, name: string, startDate: Date, endDate: Date): Promise<string> {
    return await apiRequest(service, 'clone-preplan', {
      parentPreplanId,
      name,
      startDate: startDate.toJSON(),
      endDate: endDate.toJSON()
    });
  }
}
