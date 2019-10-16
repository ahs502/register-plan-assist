import RequestManager from 'src/utils/RequestManager';
import Id from '@core/types/Id';
import PreplanHeaderModel from '@core/models/preplan/PreplanHeaderModel';
import NewPreplanModel from '@core/models/preplan/NewPreplanModel';
import FlightModel from '@core/models/flight/FlightModel';
import PreplanModel from '@core/models/preplan/PreplanModel';

const request = RequestManager.makeRequester('flight');

export default class FlightService {
  /**
   * Edits all the given flights.
   */
  static async editFlightRequirements(preplanId: Id, flights: readonly FlightModel[]): Promise<PreplanModel> {
    return await request('edit', { preplanId, flights });
  }
}
