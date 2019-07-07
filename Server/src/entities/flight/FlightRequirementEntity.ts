import { ObjectID } from 'mongodb';
import FlightRequirementModel from '@core/models/flight/FlightRequirementModel';
import FlightDefinitionEntity, { convertFlightDefinitionEntityToModel } from './FlightDefinitionEntity';
import FlightScopeEntity, { convertFlightScopeEntityToModel } from './FlightScopeEntity';
import WeekdayFlightRequirementEntity, { convertWeekdayFlightRequirementEntityToModel } from './WeekdayFlightRequirementEntity';

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
    definition: convertFlightDefinitionEntityToModel(data.definition),
    scope: convertFlightScopeEntityToModel(data.scope),
    days: data.days.map(convertWeekdayFlightRequirementEntityToModel),
    ignored: data.ignored
  };
}
