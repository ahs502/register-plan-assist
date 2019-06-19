import AircraftSelection from '../types/AircraftSelection';

export interface FlightDefinitionModel {
  readonly label: string;
  readonly flightNumber: string;
  readonly departureAirportId: string;
  readonly arrivalAirportId: string;
}

export interface FlightTimeModel {
  readonly stdLowerBound: number;
  readonly stdUpperBound: number;
}

export interface FlightScopeModel {
  readonly blockTime: number;
  readonly times: readonly FlightTimeModel[];
  readonly aircraftSelection: AircraftSelection;
  readonly slot: boolean;
  readonly slotComment: string;
  readonly required: boolean;
}

export interface FlightModel {
  readonly std: number;
  readonly aircraftRegisterId?: string;
}

export interface WeekdayFlightRequirementModel {
  readonly scope: FlightScopeModel;
  readonly notes: string;
  readonly day: number;
  readonly flight: FlightModel;
}

export default interface FlightRequirementModel {
  readonly id: string;
  readonly definition: FlightDefinitionModel;
  readonly scope: FlightScopeModel;
  readonly days: readonly WeekdayFlightRequirementModel[];
  readonly ignored: boolean;
}
