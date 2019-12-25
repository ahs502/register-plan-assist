import Id from '@core/types/Id';
import { Xml, xmlStringify, xmlParse, xmlArray } from 'src/utils/xml';
import { convertFlightLegModelToEntity, convertFlightLegEntityToModel } from 'src/entities/flight/FlightLegEntity';
import NewFlightModel from '@core/models/flight/NewFlightModel';
import { convertFlightChangeModelToEntity, convertFlightChangeEntityToModel } from 'src/entities/flight/FlightChangeEntity';

export default interface NewFlightEntity {
  readonly day: number;
  readonly aircraftRegisterId: Id | null;
  readonly legsXml: Xml;
  readonly changesXml: Xml;
}

export function convertNewFlightModelToEntity(data: NewFlightModel): NewFlightEntity {
  return {
    day: data.day,
    aircraftRegisterId: data.aircraftRegisterId === undefined ? null : data.aircraftRegisterId,
    legsXml: xmlStringify({ FlightLeg: data.legs.map(convertFlightLegModelToEntity) }, 'Legs'),
    changesXml: xmlStringify({ FlightChange: data.changes.map(convertFlightChangeModelToEntity) }, 'Changes')
  };
}
export function convertNewFlightEntityToModel(data: NewFlightEntity): NewFlightModel {
  return {
    day: data.day,
    aircraftRegisterId: data.aircraftRegisterId === null ? undefined : data.aircraftRegisterId,
    legs: xmlArray(xmlParse(data.legsXml, 'Legs').FlightLeg).map(convertFlightLegEntityToModel),
    changes: xmlArray(xmlParse(data.changesXml, 'Changes')).map(convertFlightChangeEntityToModel)
  };
}
