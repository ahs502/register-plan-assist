import FlightTimeModel from '@core/models/flight/FlightTimeModel';

export default interface FlightTimeEntity {
  readonly stdLowerBound: number;
  readonly stdUpperBound: number;
}

export function convertFlightTimeEntityToModel(data: FlightTimeEntity): FlightTimeModel {
  return {
    stdLowerBound: data.stdLowerBound,
    stdUpperBound: data.stdUpperBound
  };
}
