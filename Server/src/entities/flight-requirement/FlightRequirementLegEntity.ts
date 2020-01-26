import Id from '@core/types/Id';
import { XmlBoolean, booleanToXml, xmlToBoolean, xmlEscape, normalizeXml } from 'src/utils/xml';
import FlightRequirementLegModel from '@core/models/flight-requirement/FlightRequirementLegModel';

export default interface FlightRequirementLegEntity {
  readonly _attributes: {
    readonly FlightNumber: string;
    readonly Id_DepartureAirport: Id;
    readonly Id_ArrivalAirport: Id;
    readonly BlockTime: string;
    readonly StdLowerBound: string;
    readonly StdUpperBound?: string;
    readonly OriginPermission: XmlBoolean;
    readonly DestinationPermission: XmlBoolean;
  };
  readonly OriginPermissionNote: string;
  readonly DestinationPermissionNote: string;
}

export function convertFlightRequirementLegModelToEntity(data: FlightRequirementLegModel): FlightRequirementLegEntity {
  return {
    _attributes: {
      FlightNumber: data.flightNumber,
      Id_DepartureAirport: data.departureAirportId,
      Id_ArrivalAirport: data.arrivalAirportId,
      BlockTime: String(data.blockTime),
      StdLowerBound: String(data.stdLowerBound),
      StdUpperBound: data.stdUpperBound === undefined ? undefined : String(data.stdUpperBound),
      OriginPermission: booleanToXml(data.originPermission),
      DestinationPermission: booleanToXml(data.destinationPermission)
    },
    OriginPermissionNote: xmlEscape(data.originPermissionNote),
    DestinationPermissionNote: xmlEscape(data.destinationPermissionNote)
  };
}
export function convertFlightRequirementLegEntityToModel(data: FlightRequirementLegEntity): FlightRequirementLegModel {
  return {
    flightNumber: data._attributes.FlightNumber,
    departureAirportId: data._attributes.Id_DepartureAirport,
    arrivalAirportId: data._attributes.Id_ArrivalAirport,
    blockTime: Number(data._attributes.BlockTime),
    stdLowerBound: Number(data._attributes.StdLowerBound),
    stdUpperBound: data._attributes.StdUpperBound === undefined ? undefined : Number(data._attributes.StdUpperBound),
    originPermission: xmlToBoolean(data._attributes.OriginPermission),
    destinationPermission: xmlToBoolean(data._attributes.DestinationPermission),
    originPermissionNote: normalizeXml((data.OriginPermissionNote as any)?._text as string),
    destinationPermissionNote: normalizeXml((data.DestinationPermissionNote as any)?._text as string)
  };
}
