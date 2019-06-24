import { ObjectID } from 'mongodb';
import AircraftSelection from '@core/types/AircraftSelection';
import FlightRequirementModel from '@core/models/FlightRequirementModel';
import Daytime from '@core/types/Daytime';

export interface FlightDefinitionEntity {
  readonly label: string;
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

export function convertFlightRequirementEntityToModel(data: FlightRequirementEntity): FlightRequirementModel {
  return {
    id: data._id!.toHexString(),
    definition: data.definition,
    scope: {
      ...data.scope,
      times: data.scope.times.map(t => ({
        stdLowerBound: new Daytime(t.stdLowerBound),
        stdUpperBound: new Daytime(t.stdUpperBound)
      }))
    },
    days: data.days.map(d => ({
      scope: {
        ...d.scope,
        times: d.scope.times.map(t => ({
          stdLowerBound: new Daytime(t.stdLowerBound),
          stdUpperBound: new Daytime(t.stdUpperBound)
        }))
      },
      notes: d.notes,
      day: d.day,
      flight: {
        std: new Daytime(d.flight.std),
        aircraftRegisterId: d.flight.aircraftRegisterId
      }
    })),
    ignored: data.ignored
  } as any;
}
