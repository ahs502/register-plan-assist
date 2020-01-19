import { XmlBoolean, booleanToXml, xmlToBoolean, xmlEscape } from 'src/utils/xml';
import FlightRequirementLegChangeModel from '@core/models/flight-requirement/FlightRequirementLegChangeModel';

export default interface FlightRequirementLegChangeEntity {
  readonly _attributes: {
    readonly BlockTime: string;
    readonly StdLowerBound: string;
    readonly StdUpperBound?: string;
    readonly OriginPermission: XmlBoolean;
    readonly DestinationPermission: XmlBoolean;
    readonly OriginPermissionNote: string;
    readonly DestinationPermissionNote: string;
  };
}

export function convertFlightRequirementLegChangeModelToEntity(data: FlightRequirementLegChangeModel): FlightRequirementLegChangeEntity {
  return {
    _attributes: {
      BlockTime: String(data.blockTime),
      StdLowerBound: String(data.stdLowerBound),
      StdUpperBound: data.stdUpperBound === undefined ? undefined : String(data.stdUpperBound),
      OriginPermission: booleanToXml(data.originPermission),
      DestinationPermission: booleanToXml(data.destinationPermission),
      OriginPermissionNote: xmlEscape(data.originPermissionNote),
      DestinationPermissionNote: xmlEscape(data.destinationPermissionNote)
    }
  };
}
export function convertFlightRequirementLegChangeEntityToModel(data: FlightRequirementLegChangeEntity): FlightRequirementLegChangeModel {
  return {
    blockTime: Number(data._attributes.BlockTime),
    stdLowerBound: Number(data._attributes.StdLowerBound),
    stdUpperBound: data._attributes.StdUpperBound === undefined ? undefined : Number(data._attributes.StdUpperBound),
    originPermission: xmlToBoolean(data._attributes.OriginPermission),
    destinationPermission: xmlToBoolean(data._attributes.DestinationPermission),
    originPermissionNote: data._attributes.OriginPermissionNote,
    destinationPermissionNote: data._attributes.DestinationPermissionNote
  };
}
