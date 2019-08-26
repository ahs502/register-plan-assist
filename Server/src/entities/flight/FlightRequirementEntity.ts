import FlightRequirementModel from '@core/models/flights/FlightRequirementModel';
import { getJson } from 'src/utils/xml2json';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';
import { convertflightScopeEntityToModel as convertFlightScopeEntityToModel } from './FlightScopeEntity';
import { convertWeekdayFlightRequirementEntityToModel } from './WeekdayFlightRequirementEntity';
import { xmlParse } from 'src/utils/xml';
import { convertWeekdayFlightRequirementListEntityToModel } from './WeekdayFlightRequirementListEntity';

export default interface FlightRequirementEntity {
  readonly id: string;
  readonly preplanId?: string;
  readonly scope: string;
  readonly days: string;
  readonly ignored: boolean;
  readonly label: string;
  readonly category: string;
  readonly stcId: string;
  readonly flightNumber: string;
  readonly departureAirportId: string;
  readonly arrivalAirportId: string;
}

export function convertFlightRequirementEntityToModel(data: FlightRequirementEntity): FlightRequirementModel {
  return {
    id: data.id,
    definition: {
      arrivalAirportId: data.arrivalAirportId,
      departureAirportId: data.departureAirportId,
      category: data.category,
      flightNumber: data.flightNumber,
      label: data.label,
      stcId: data.stcId
    },
    scope: convertFlightScopeEntityToModel(xmlParse(data.scope, 'Scope')),
    days: convertWeekdayFlightRequirementListEntityToModel(xmlParse(data.days, 'WeekdayFlightRequirements')),
    ignored: data.ignored
  };
}
