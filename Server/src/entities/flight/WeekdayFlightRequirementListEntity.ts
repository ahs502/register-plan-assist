import WeekdayFlightRequirementEntity, { convertWeekdayFlightRequirementModelToEntity, convertWeekdayFlightRequirementEntityToModel } from './WeekdayFlightRequirementEntity';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';
import { XmlArray } from 'src/utils/xml';

export default interface WeekdayFlightRequirementListEntity {
  readonly WeekdayFlightRequirement: XmlArray<WeekdayFlightRequirementEntity>;
}

export function convertWeekdayFlightRequirementListModelToEntity(data: readonly WeekdayFlightRequirementModel[]): WeekdayFlightRequirementListEntity {
  return {
    WeekdayFlightRequirement: data.map(convertWeekdayFlightRequirementModelToEntity)
  };
}

export function convertWeekdayFlightRequirementListEntityToModel(data: WeekdayFlightRequirementListEntity): readonly WeekdayFlightRequirementModel[] {
  return !data.WeekdayFlightRequirement ? [] : [].concat(data.WeekdayFlightRequirement).map(convertWeekdayFlightRequirementEntityToModel);
}
