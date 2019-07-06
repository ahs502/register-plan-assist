import AircraftSelection from '@core/types/AircraftSelection';
import FlightTimeModel from './FlightTimeModel';

export interface FlightScopeModel {
  readonly blockTime: number;
  readonly times: readonly FlightTimeModel[];
  readonly aircraftSelection: AircraftSelection;
  readonly slot: boolean;
  readonly slotComment: string;
  readonly required: boolean;
}
