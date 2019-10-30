import Id from '@core/types/Id';
import { Xml, xmlStringify, xmlParse, xmlArray } from 'src/utils/xml';
import { convertFlightLegModelToEntity, convertFlightLegEntityToModel } from 'src/entities/flight/FlightLegEntity';
import NewFlightModel from '@core/models/flight/NewFlightModel';

export default interface NewFlightEntity {
  readonly day: number;
  readonly aircraftRegisterId: Id | null;
  readonly legsXml: Xml;
}

export function convertNewFlightModelToEntity(data: NewFlightModel): NewFlightEntity {
  return {
    day: data.day,
    aircraftRegisterId: data.aircraftRegisterId === undefined ? null : data.aircraftRegisterId,
    legsXml: xmlStringify({ FlightLeg: data.legs.map(convertFlightLegModelToEntity) }, 'Legs')
  };
}
export function convertNewFlightEntityToModel(data: NewFlightEntity): NewFlightModel {
  return {
    day: data.day,
    aircraftRegisterId: data.aircraftRegisterId === null ? undefined : data.aircraftRegisterId,
    legs: xmlArray(xmlParse(data.legsXml, 'Legs')).map(convertFlightLegEntityToModel)
  };
}
