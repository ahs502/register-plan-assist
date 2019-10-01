import AircraftSelectionModel from '@core/models/AircraftSelectionModel';
import Rsx from '@core/types/Rsx';
import DayFlightRequirementLegModel from './DayFlightRequirementLegModel';
import Id from '@core/types/Id';

export default interface DayFlightRequirementModel {
  readonly aircraftSelection: AircraftSelectionModel;
  readonly rsx: Rsx;
  readonly required: boolean;
  readonly freezed: boolean;
  readonly day: number;
  readonly aircraftRegisterId?: Id;
  readonly notes: string;
  readonly route: readonly DayFlightRequirementLegModel[];
}
