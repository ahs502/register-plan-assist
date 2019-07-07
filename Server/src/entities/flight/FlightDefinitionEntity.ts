import FlightDefinitionModel from '@core/models/flight/FlightDefinitionModel';

export default interface FlightDefinitionEntity {
  readonly label: string;
  readonly stcId: string;
  readonly flightNumber: string;
  readonly departureAirportId: string;
  readonly arrivalAirportId: string;
}

export function convertFlightDefinitionEntityToModel(data: FlightDefinitionEntity): FlightDefinitionModel {
  return {
    label: data.label,
    stcId: data.stcId,
    flightNumber: data.flightNumber,
    departureAirportId: data.departureAirportId,
    arrivalAirportId: data.arrivalAirportId
  };
}
