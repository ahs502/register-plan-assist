import FlightDefinitionModel from './FlightDefinitionModel';
import { FlightScopeModel } from './FlightScopeModel';
import WeekdayFlightRequirementModel from './WeekdayFlightRequirementModel';

export default interface FlightRequirementModel {
  readonly id: string;
  readonly definition: FlightDefinitionModel;
  readonly scope: FlightScopeModel;
  readonly days: readonly WeekdayFlightRequirementModel[];
  readonly ignored: boolean;
}
