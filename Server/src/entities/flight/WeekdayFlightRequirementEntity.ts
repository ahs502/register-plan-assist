import FlightScopeEntity, { convertFlightScopeModelToEntity, convertflightScopeEntityToModel } from './FlightScopeEntity';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';
import { xmlEscape } from 'src/utils/xml';

export default interface WeekdayFlightRequirementEntity {
  readonly _attributes: {
    readonly Notes: string;
    readonly Freezed: string;
    readonly Day: string;
  };
  readonly Scope: FlightScopeEntity;
  readonly Flight: {
    readonly _attributes: {
      readonly Std: string;
      readonly Id_AircraftRegister: string;
    };
  };
}

export function convertWeekdayFlightRequirementModelToEntity(data: WeekdayFlightRequirementModel): WeekdayFlightRequirementEntity {
  return {
    _attributes: {
      Notes: xmlEscape(data.notes),
      Freezed: String(data.freezed),
      Day: String(data.day)
    },
    Scope: convertFlightScopeModelToEntity(data.scope),
    Flight: {
      _attributes: {
        Std: String(data.flight.std),
        Id_AircraftRegister: data.flight.aircraftRegisterId || ''
      }
    }
  };
}

export function convertWeekdayFlightRequirementEntityToModel(data: WeekdayFlightRequirementEntity): WeekdayFlightRequirementModel {
  return {
    scope: convertflightScopeEntityToModel(data.Scope),
    notes: data._attributes.Notes,
    freezed: data._attributes.Freezed === 'true',
    day: Number(data._attributes.Day),
    flight: {
      std: Number(data.Flight._attributes.Std),
      aircraftRegisterId: data.Flight._attributes.Id_AircraftRegister || undefined
    }
  };
}
