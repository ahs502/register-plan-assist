import FlightRequirementModel from '@core/models/flights/FlightRequirementModel';
import { getJson } from 'src/utils/xml2json';
import { FlightScopeModel } from '@core/models/flights/FlightScopeModel';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';

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

export async function convertFlightRequirementEntityToModel(data: FlightRequirementEntity): Promise<FlightRequirementModel> {
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
    scope: await getJson<FlightScopeModel>(data.scope),
    days: await getJson<WeekdayFlightRequirementModel[]>(data.days),
    ignored: data.ignored
  };
}
