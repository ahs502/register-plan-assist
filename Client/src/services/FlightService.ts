import RequestManager from 'src/utils/RequestManager';
import Id from '@core/types/Id';
import FlightModel from '@core/models/flight/FlightModel';
import PreplanDataModel from '@core/models/preplan/PreplanDataModel';

const request = RequestManager.makeRequester('flight');

export default class FlightService {
  /**
   * Edits all the given flight(s) and provides the preplan data model.
   */
  static async edit(preplanId: Id, ...flights: readonly FlightModel[]): Promise<PreplanDataModel> {
    return await request('edit', { preplanId, flights });
  }
}
