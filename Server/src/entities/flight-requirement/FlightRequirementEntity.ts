import Id from '@core/types/Id';
import FlightRequirementModel from '@core/models/flight-requirement/FlightRequirementModel';
import NewFlightRequirementEntity, { convertNewFlightRequirementModelToEntity, convertNewFlightRequirementEntityToModel } from './NewFlightRequirementEntity';

export default interface FlightRequirementEntity extends NewFlightRequirementEntity {
  readonly id: Id;
}

export function convertFlightRequirementModelToEntity(data: FlightRequirementModel): FlightRequirementEntity {
  return {
    id: data.id,
    ...convertNewFlightRequirementModelToEntity(data)
  };
}
export function convertFlightRequirementEntityToModel(data: FlightRequirementEntity): FlightRequirementModel {
  return {
    id: data.id,
    ...convertNewFlightRequirementEntityToModel(data)
  };
}
