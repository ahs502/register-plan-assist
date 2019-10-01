import Id from '@core/types/Id';
import { XmlBoolean, XmlArray, booleanToXml, xmlToBoolean, xmlArray } from 'src/utils/xml';
import StdBoundaryEntity, { convertStdBoundaryModelToEntity, convertStdBoundaryEntityToModel } from './StdBoundaryEntity';
import FlightRequirementLegModel from '@core/models/flight-requirement/FlightRequirementLegModel';

export default interface FlightRequirementLegEntity {
  readonly _attributes: {
    readonly FlightNumber: string;
    readonly Id_DepartureAirport: Id;
    readonly Id_ArrivalAirport: Id;
    readonly BlockTime: string;
    readonly OriginPermission: XmlBoolean;
    readonly DestinationPermission: XmlBoolean;
  };
  readonly StdBoundaries: {
    readonly StdBoundary: XmlArray<StdBoundaryEntity>;
  };
}

export function convertFlightRequirementLegModelToEntity(data: FlightRequirementLegModel): FlightRequirementLegEntity {
  return {
    _attributes: {
      FlightNumber: data.flightNumber,
      Id_DepartureAirport: data.departureAirportId,
      Id_ArrivalAirport: data.arrivalAirportId,
      BlockTime: String(data.blockTime),
      OriginPermission: booleanToXml(data.originPermission),
      DestinationPermission: booleanToXml(data.destinationPermission)
    },
    StdBoundaries: {
      StdBoundary: data.stdBoundaries.map(convertStdBoundaryModelToEntity)
    }
  };
}
export function convertFlightRequirementLegEntityToModel(data: FlightRequirementLegEntity): FlightRequirementLegModel {
  return {
    flightNumber: data._attributes.FlightNumber,
    departureAirportId: data._attributes.Id_DepartureAirport,
    arrivalAirportId: data._attributes.Id_ArrivalAirport,
    blockTime: Number(data._attributes.BlockTime),
    originPermission: xmlToBoolean(data._attributes.OriginPermission),
    destinationPermission: xmlToBoolean(data._attributes.DestinationPermission),
    stdBoundaries: xmlArray(data.StdBoundaries.StdBoundary).map(convertStdBoundaryEntityToModel)
  };
}
