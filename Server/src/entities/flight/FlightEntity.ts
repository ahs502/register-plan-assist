import FlightModel from '@core/models/flight/FlightModel';

export default interface FlightEntity {
  readonly std: number;
  readonly aircraftRegisterId?: string;
}

export function convertFlightEntityToModel(data: FlightEntity): FlightModel {
  return {
    std: data.std,
    aircraftRegisterId: data.aircraftRegisterId
  };
}
