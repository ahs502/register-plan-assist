import Id from '@core/types/Id';
import { Xml, xmlStringify, xmlParse, xmlArray } from 'src/utils/xml';
import { convertFlightLegModelToEntity, convertFlightLegEntityToModel } from 'src/entities/flight/FlightLegEntity';
import EditFlightModel from '@core/models/flight/EditFlightModel';

export default interface EditFlightEntity {
  readonly id: Id | null;
  readonly date: string;
  readonly aircraftRegisterId: Id | null;
  readonly legsXml: Xml;
}

export function convertEditFlightModelToEntity(data: EditFlightModel): EditFlightEntity {
  return {
    id: data.id === undefined ? null : data.id,
    date: new Date(data.date).toJSON(),
    aircraftRegisterId: data.aircraftRegisterId === undefined ? null : data.aircraftRegisterId,
    legsXml: xmlStringify({ FlightLeg: data.legs.map(convertFlightLegModelToEntity) }, 'Legs')
  };
}
export function convertEditFlightEntityToModel(data: EditFlightEntity): EditFlightModel {
  return {
    id: data.id === null ? undefined : data.id,
    date: new Date(data.date).toJSON(),
    aircraftRegisterId: data.aircraftRegisterId === null ? undefined : data.aircraftRegisterId,
    legs: xmlArray(xmlParse(data.legsXml, 'Legs').FlightLeg).map(convertFlightLegEntityToModel)
  };
}
