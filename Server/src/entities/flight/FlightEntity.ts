import Id from '@core/types/Id';
import FlightModel from '@core/models/flight/FlightModel';
import NewFlightEntity, { convertNewFlightModelToEntity, convertNewFlightEntityToModel } from 'src/entities/flight/NewFlightEntity';

export default interface FlightEntity extends NewFlightEntity {
  readonly id: Id;
  readonly flightRequirementId: Id;
}

export function convertFlightModelToEntity(data: FlightModel): FlightEntity {
  return {
    id: data.id,
    flightRequirementId: data.flightRequirementId,
    ...convertNewFlightModelToEntity(data)
  };
}
export function convertFlightEntityToModel(data: FlightEntity): FlightModel {
  return {
    id: data.id,
    flightRequirementId: data.flightRequirementId,
    ...convertNewFlightEntityToModel(data)
  };
}
