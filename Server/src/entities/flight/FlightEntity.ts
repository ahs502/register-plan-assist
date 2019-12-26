import Id from '@core/types/Id';
import FlightModel from '@core/models/flight/FlightModel';
import EditFlightEntity, { convertEditFlightModelToEntity, convertEditFlightEntityToModel } from 'src/entities/flight/EditFlightEntity';

export default interface FlightEntity extends EditFlightEntity {
  readonly id: Id;
  readonly flightRequirementId: Id;
}

export function convertFlightModelToEntity(data: FlightModel): FlightEntity {
  return {
    ...convertEditFlightModelToEntity(data),
    id: data.id,
    flightRequirementId: data.flightRequirementId
  };
}
export function convertFlightEntityToModel(data: FlightEntity): FlightModel {
  return {
    ...convertEditFlightEntityToModel(data),
    id: data.id,
    flightRequirementId: data.flightRequirementId
  };
}
