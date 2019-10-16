import RequestManager from 'src/utils/RequestManager';
import Id from '@core/types/Id';
import NewFlightRequirementModel from '@core/models/flight-requirement/NewFlightRequirementModel';
import FlightRequirementModel from '@core/models/flight-requirement/FlightRequirementModel';
import NewFlightModel from '@core/models/flight/NewFlightModel';
import FlightModel from '@core/models/flight/FlightModel';
import PreplanModel from '@core/models/preplan/PreplanModel';

const request = RequestManager.makeRequester('flight-requirement');

export default class FlightRequirementService {
  /**
   * Adds a new flight requirement including its flights per day.
   */
  static async add(preplanId: Id, newFlightRequirement: NewFlightRequirementModel, newFlights: readonly NewFlightModel[]): Promise<PreplanModel> {
    return await request('add', { preplanId, newFlightRequirement, newFlights });
  }

  /**
   * Removes a flight requirement and its flights per day.
   */
  static async remove(preplanId: Id, id: Id): Promise<PreplanModel> {
    return await request('remove', { preplanId, id });
  }

  /**
   * Edits all the given flight requirements and its related flights, adding new created flights and removing droped ones..
   */
  static async edit(preplanId: Id, flightRequirement: FlightRequirementModel, flights: readonly FlightModel[], newFlights: readonly NewFlightModel[]): Promise<PreplanModel> {
    return await request('edit', { preplanId, flightRequirement, flights, newFlights });
  }
}
