import { FlightScopeModel } from '@core/models/flight/FlightScopeModel';
import FlightTimeEntity, { convertFlightTimeEntityToModel } from './FlightTimeEntity';
import AircraftSelectionEntity, { convertAircraftSelectionEnitityToModel } from '../AircraftSelectionEntity';

export default interface FlightScopeEntity {
  readonly blockTime: number;
  readonly times: readonly FlightTimeEntity[];
  readonly aircraftSelection: AircraftSelectionEntity;
  readonly slot: boolean;
  readonly slotComment: string;
  readonly required: boolean;
}

export function convertFlightScopeEntityToModel(data: FlightScopeEntity): FlightScopeModel {
  return {
    blockTime: data.blockTime,
    times: data.times.map(convertFlightTimeEntityToModel),
    aircraftSelection: convertAircraftSelectionEnitityToModel(data.aircraftSelection),
    slot: data.slot,
    slotComment: data.slotComment,
    required: data.required
  };
}
