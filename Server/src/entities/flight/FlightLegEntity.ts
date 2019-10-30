import FlightLegModel from '@core/models/flight/FlightLegModel';

export default interface FlightLegEntity {
  readonly _attributes: {
    readonly Std: string;
  };
}

export function convertFlightLegModelToEntity(data: FlightLegModel): FlightLegEntity {
  return {
    _attributes: {
      Std: String(data.std)
    }
  };
}
export function convertFlightLegEntityToModel(data: FlightLegEntity): FlightLegModel {
  return {
    std: Number(data._attributes.Std)
  };
}
