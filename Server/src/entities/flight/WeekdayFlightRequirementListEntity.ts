import WeekdayFlightRequirementEntity, { convertWeekdayFlightRequirementModelToEntity, convertWeekdayFlightRequirementEntityToModel } from './WeekdayFlightRequirementEntity';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';
import { XmlArray, xmlArray } from 'src/utils/xml';

export default interface WeekdayFlightRequirementListEntity {
  readonly WeekdayFlightRequirement: XmlArray<WeekdayFlightRequirementEntity>;
}

export function convertWeekdayFlightRequirementListModelToEntity(data: readonly WeekdayFlightRequirementModel[]): WeekdayFlightRequirementListEntity {
  return {
    WeekdayFlightRequirement: data.map(convertWeekdayFlightRequirementModelToEntity)
  };
}

export function convertWeekdayFlightRequirementListEntityToModel(data: WeekdayFlightRequirementListEntity): readonly WeekdayFlightRequirementModel[] {
  return xmlArray(data.WeekdayFlightRequirement).map(convertWeekdayFlightRequirementEntityToModel);
}
