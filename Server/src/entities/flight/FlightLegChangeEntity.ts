import FlightLegChangeModel from '@core/models/flight/FlightLegChangeModel';

export default interface FlightLegChangeEntity {
  readonly _attributes: {
    readonly Std: string;
  };
}

export function convertFlightLegChangeModelToEntity(data: FlightLegChangeModel): FlightLegChangeEntity {
  return {
    _attributes: {
      Std: String(data.std)
    }
  };
}
export function convertFlightLegChangeEntityToModel(data: FlightLegChangeEntity): FlightLegChangeModel {
  return {
    std: Number(data._attributes.Std)
  };
}
