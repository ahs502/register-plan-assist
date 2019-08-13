import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';
import FlightScopeEntity, { convertFlightScopeEntityToModel } from './FlightScopeEntity';
import FlightEntity, { convertFlightEntityToModel } from './FlightEntity';

export default interface WeekdayFlightRequirementEntity {
  readonly scope: FlightScopeEntity;
  readonly notes: string;
  readonly day: number;
  readonly flight: FlightEntity;
}

export function convertWeekdayFlightRequirementEntityToModel(data: WeekdayFlightRequirementEntity): WeekdayFlightRequirementModel {
  return {
    scope: convertFlightScopeEntityToModel(data.scope),
    notes: data.notes,
    freezed: false,
    day: data.day,
    flight: convertFlightEntityToModel(data.flight)
  };
}
