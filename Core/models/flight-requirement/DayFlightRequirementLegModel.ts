import StdBoundaryModel from './StdBoundaryModel';

export default interface DayFlightRequirementLegModel {
  readonly blockTime: number;
  readonly stdBoundaries: readonly StdBoundaryModel[];
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;
  readonly std: number;
}
