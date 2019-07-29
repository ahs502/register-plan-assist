import FlightTimeModel from '@core/models/flight/FlightTimeModel';

export default interface FlightTimeEntity {
  readonly StdLowerBound: number;
  readonly StdUpperBound: number;
}

// export function convertFlightTimeEntityToModel(data: FlightTimeEntity): FlightTimeModel {
//   return {
//     stdLowerBound: data.stdLowerBound,
//     stdUpperBound: data.stdUpperBound
//   };
// }
