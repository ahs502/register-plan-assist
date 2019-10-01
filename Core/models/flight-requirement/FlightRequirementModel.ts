import AircraftSelectionModel from '../AircraftSelectionModel';
import Rsx from '@core/types/Rsx';
import FlightRequirementLegModel from './FlightRequirementLegModel';
import DayFlightRequirementModel from './DayFlightRequirementModel';
import Id from '@core/types/Id';

export default interface FlightRequirementModel {
  readonly id?: Id;
  readonly label: string;
  readonly category: string;
  readonly stcId: Id;
  readonly aircraftSelection: AircraftSelectionModel;
  readonly rsx: Rsx;
  readonly required: boolean;
  readonly ignored: boolean;
  readonly route: readonly FlightRequirementLegModel[];
  readonly days: readonly DayFlightRequirementModel[];
}
