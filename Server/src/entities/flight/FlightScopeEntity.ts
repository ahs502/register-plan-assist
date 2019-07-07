import AircraftSelection from '@core/types/AircraftSelection';
import { FlightScopeModel } from '@core/models/flight/FlightScopeModel';
import FlightTimeEntity, { convertFlightTimeEntityToModel } from './FlightTimeEntity';

export default interface FlightScopeEntity {
  readonly blockTime: number;
  readonly times: readonly FlightTimeEntity[];
  readonly aircraftSelection: AircraftSelection;
  readonly slot: boolean;
  readonly slotComment: string;
  readonly required: boolean;
}

export function convertFlightScopeEntityToModel(data: FlightScopeEntity): FlightScopeModel {
  return {
    blockTime: data.blockTime,
    times: data.times.map(convertFlightTimeEntityToModel),
    aircraftSelection: data.aircraftSelection,
    slot: data.slot,
    slotComment: data.slotComment,
    required: data.required
  };
}
