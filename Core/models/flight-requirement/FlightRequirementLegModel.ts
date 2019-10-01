import StdBoundaryModel from './StdBoundaryModel';
import Id from '@core/types/Id';

export default interface FlightRequirementLegModel {
  readonly flightNumber: string;
  readonly departureAirportId: Id;
  readonly arrivalAirportId: Id;
  readonly blockTime: number;
  readonly stdBoundaries: readonly StdBoundaryModel[];
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;
}
