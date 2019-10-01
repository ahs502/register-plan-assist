import Id from '@core/types/Id';
import { Xml, xmlEscape, xmlStringify, xmlParse, xmlArray } from 'src/utils/xml';
import Rsx from '@core/types/Rsx';
import FlightRequirementModel from '@core/models/flight-requirement/FlightRequirementModel';
import { convertAircraftSelectionModelToEntity, convertAircraftSelectionEntityToModel } from 'src/entities/AircraftSelectionEntity';
import { convertFlightRequirementLegModelToEntity, convertFlightRequirementLegEntityToModel } from './FlightRequirementLegEntity';
import { convertDayFlightRequirementModelToEntity, convertDayFlightRequirementEntityToModel } from './DayFlightRequirementEntity';

export default interface FlightRequirementEntity {
  readonly id?: Id;
  readonly label: string;
  readonly category: string;
  readonly stcId: Id;
  readonly aircraftSelectionXml: Xml;
  readonly rsx: Rsx;
  readonly required: boolean;
  readonly ignored: boolean;
  readonly routeXml: Xml;
  readonly daysXml: Xml;
}

export function convertFlightRequirementModelToEntity(data: FlightRequirementModel): FlightRequirementEntity {
  return {
    id: data.id,
    label: xmlEscape(data.label),
    category: xmlEscape(data.category),
    stcId: data.stcId,
    aircraftSelectionXml: xmlStringify(convertAircraftSelectionModelToEntity(data.aircraftSelection), 'AircraftSelection'),
    rsx: data.rsx,
    required: data.required,
    ignored: data.ignored,
    routeXml: xmlStringify({ FlightRequirementLeg: data.route.map(convertFlightRequirementLegModelToEntity) }, 'Route'),
    daysXml: xmlStringify({ DayFlightRequirement: data.days.map(convertDayFlightRequirementModelToEntity) }, 'Days')
  };
}
export function convertFlightRequirementEntityToModel(data: FlightRequirementEntity): FlightRequirementModel {
  return {
    id: data.id,
    label: data.label,
    category: data.category,
    stcId: data.stcId,
    aircraftSelection: convertAircraftSelectionEntityToModel(xmlParse(data.aircraftSelectionXml, 'AircraftSelection')),
    rsx: data.rsx,
    required: data.required,
    ignored: data.ignored,
    route: xmlArray(xmlParse(data.routeXml, 'Route').FlightRequirementLeg).map(convertFlightRequirementLegEntityToModel),
    days: xmlArray(xmlParse(data.daysXml, 'Days').DayFlightRequirement).map(convertDayFlightRequirementEntityToModel)
  };
}
