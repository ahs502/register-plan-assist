import WeekdayFlightRequirementEntity, { convertWeekdayFlightRequirementModelToEntity, convertWeekdayFlightRequirementEntityToModel } from './WeekdayFlightRequirementEntity';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';

export default interface WeekdayFlightRequirementListEntity {
  readonly WeekdayFlightRequirement: readonly WeekdayFlightRequirementEntity[];
}

export function convertWeekdayFlightRequirementListModelToEntity(data: readonly WeekdayFlightRequirementModel[]): WeekdayFlightRequirementListEntity {
  return {
    WeekdayFlightRequirement: data.map(convertWeekdayFlightRequirementModelToEntity)
  };
}

export function convertWeekdayFlightRequirementListEntityToModel(data: WeekdayFlightRequirementListEntity): readonly WeekdayFlightRequirementModel[] {
  return data.WeekdayFlightRequirement.map(convertWeekdayFlightRequirementEntityToModel);
}
