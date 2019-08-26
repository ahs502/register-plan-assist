import FlightTimeModel from '@core/models/flights/FlightTimeModel';

export default interface FlightTimeEntity {
  readonly _attributes: {
    readonly StdLowerBound: string;
    readonly StdUpperBound: string;
  };
}

export function convertFlightTimeModelToEntity(data: FlightTimeModel): FlightTimeEntity {
  return {
    _attributes: {
      StdLowerBound: String(data.stdLowerBound),
      StdUpperBound: String(data.stdUpperBound)
    }
  };
}

export function convertFlightTimeEntityToModel(data: FlightTimeEntity): FlightTimeModel {
  return {
    stdLowerBound: Number(data._attributes.StdLowerBound),
    stdUpperBound: Number(data._attributes.StdUpperBound)
  };
}
