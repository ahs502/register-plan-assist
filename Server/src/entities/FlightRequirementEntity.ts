import { ObjectID } from 'mongodb';
import AircraftSelection from '@core/types/AircraftSelection';
import FlightRequirementModel, { FlightDefinitionModel, FlightTimeModel, FlightScopeModel, FlightModel, WeekdayFlightRequirementModel } from '@core/models/FlightRequirementModel';
import Daytime from '@core/types/Daytime';

export interface FlightDefinitionEntity {
  readonly label: string;
  readonly stcId: string;
  readonly flightNumber: string;
  readonly departureAirportId: string;
  readonly arrivalAirportId: string;
}

export interface FlightTimeEntity {
  readonly stdLowerBound: number;
  readonly stdUpperBound: number;
}

export interface FlightScopeEntity {
  readonly blockTime: number;
  readonly times: readonly FlightTimeEntity[];
  readonly aircraftSelection: AircraftSelection;
  readonly slot: boolean;
  readonly slotComment: string;
  readonly required: boolean;
}

export interface FlightEntity {
  readonly std: number;
  readonly aircraftRegisterId?: string;
}

export interface WeekdayFlightRequirementEntity {
  readonly scope: FlightScopeEntity;
  readonly notes: string;
  readonly day: number;
  readonly flight: FlightEntity;
}

export default interface FlightRequirementEntity {
  readonly _id?: ObjectID;
  readonly preplanId: ObjectID;
  readonly definition: FlightDefinitionEntity;
  readonly scope: FlightScopeEntity;
  readonly days: readonly WeekdayFlightRequirementEntity[];
  readonly ignored: boolean;
}

export function convertFlightDefinitionEntityToModel(data: FlightDefinitionEntity): FlightDefinitionModel {
  return {
    label: data.label,
    stcId: data.stcId,
    flightNumber: data.flightNumber,
    departureAirportId: data.departureAirportId,
    arrivalAirportId: data.arrivalAirportId
  };
}

export function convertFlightTimeEntityToModel(data: FlightTimeEntity): FlightTimeModel {
  return {
    stdLowerBound: data.stdLowerBound,
    stdUpperBound: data.stdUpperBound
  };
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

export function convertFlightEntityToModel(data: FlightEntity): FlightModel {
  return {
    std: data.std,
    aircraftRegisterId: data.aircraftRegisterId
  };
}

export function convertWeekdayFlightRequirementEntityToModel(data: WeekdayFlightRequirementEntity): WeekdayFlightRequirementModel {
  return {
    scope: convertFlightScopeEntityToModel(data.scope),
    notes: data.notes,
    day: data.day,
    flight: convertFlightEntityToModel(data.flight)
  };
}

export function convertFlightRequirementEntityToModel(data: FlightRequirementEntity): FlightRequirementModel {
  return {
    id: data._id!.toHexString(),
    definition: convertFlightDefinitionEntityToModel(data.definition),
    scope: convertFlightScopeEntityToModel(data.scope),
    days: data.days.map(convertWeekdayFlightRequirementEntityToModel),
    ignored: data.ignored
  };
}
