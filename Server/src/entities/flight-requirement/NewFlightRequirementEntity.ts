import Id from '@core/types/Id';
import { Xml, xmlStringify, xmlParse, xmlArray } from 'src/utils/xml';
import Rsx from '@core/types/Rsx';
import NewFlightRequirementModel from '@core/models/flight-requirement/NewFlightRequirementModel';
import { convertAircraftSelectionModelToEntity, convertAircraftSelectionEntityToModel } from '../AircraftSelectionEntity';
import { convertFlightRequirementLegModelToEntity, convertFlightRequirementLegEntityToModel } from './FlightRequirementLegEntity';
import { convertDayFlightRequirementModelToEntity, convertDayFlightRequirementEntityToModel } from './DayFlightRequirementEntity';
import { convertFlightRequirementChangeModelToEntity, convertFlightRequirementChangeEntityToModel } from 'src/entities/flight-requirement/FlightRequirementChangeEntity';

export default interface NewFlightRequirementEntity {
  readonly label: string;
  readonly category: string;
  readonly stcId: Id;
  readonly aircraftSelectionXml: Xml;
  readonly rsx: Rsx;
  readonly notes: string;
  readonly ignored: boolean;
  readonly routeXml: Xml;
  readonly daysXml: Xml;
  readonly changesXml: Xml;
}

export function convertNewFlightRequirementModelToEntity(data: NewFlightRequirementModel): NewFlightRequirementEntity {
  return {
    label: data.label,
    category: data.category,
    stcId: data.stcId,
    aircraftSelectionXml: xmlStringify(convertAircraftSelectionModelToEntity(data.aircraftSelection), 'AircraftSelection'),
    rsx: data.rsx,
    notes: data.notes,
    ignored: data.ignored,
    routeXml: xmlStringify({ FlightRequirementLeg: data.route.map(convertFlightRequirementLegModelToEntity) }, 'Route'),
    daysXml: xmlStringify({ DayFlightRequirement: data.days.map(convertDayFlightRequirementModelToEntity) }, 'Days'),
    changesXml: xmlStringify({ FlightRequirementChange: data.changes.map(convertFlightRequirementChangeModelToEntity) }, 'Changes')
  };
}
export function convertNewFlightRequirementEntityToModel(data: NewFlightRequirementEntity): NewFlightRequirementModel {
  return {
    label: data.label,
    category: data.category,
    stcId: data.stcId,
    aircraftSelection: convertAircraftSelectionEntityToModel(xmlParse(data.aircraftSelectionXml, 'AircraftSelection')),
    rsx: data.rsx,
    notes: data.notes,
    ignored: data.ignored,
    route: xmlArray(xmlParse(data.routeXml, 'Route').FlightRequirementLeg).map(convertFlightRequirementLegEntityToModel),
    days: xmlArray(xmlParse(data.daysXml, 'Days').DayFlightRequirement).map(convertDayFlightRequirementEntityToModel),
    changes: xmlArray(xmlParse(data.changesXml, 'Changes').FlightRequirementChange).map(convertFlightRequirementChangeEntityToModel)
  };
}
