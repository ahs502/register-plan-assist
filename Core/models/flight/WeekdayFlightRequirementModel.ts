import { FlightScopeModel } from './FlightScopeModel';
import FlightModel from './FlightModel';

export default interface WeekdayFlightRequirementModel {
  readonly scope: FlightScopeModel;
  readonly notes: string;
  readonly day: number;
  readonly flight: FlightModel;
}
