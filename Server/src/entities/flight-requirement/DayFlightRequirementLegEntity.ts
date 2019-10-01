import { XmlArray, xmlArray, XmlBoolean, booleanToXml, xmlToBoolean } from 'src/utils/xml';
import StdBoundaryEntity, { convertStdBoundaryModelToEntity, convertStdBoundaryEntityToModel } from './StdBoundaryEntity';
import DayFlightRequirementLegModel from '@core/models/flight-requirement/DayFlightRequirementLegModel';

export default interface DayFlightRequirementLegEntity {
  readonly _attributes: {
    readonly BlockTime: string;
    readonly OriginPermission: XmlBoolean;
    readonly DestinationPermission: XmlBoolean;
    readonly Std: string;
  };
  readonly StdBoundaries: {
    readonly StdBoundary: XmlArray<StdBoundaryEntity>;
  };
}

export function convertDayFlightRequirementLegModelToEntity(data: DayFlightRequirementLegModel): DayFlightRequirementLegEntity {
  return {
    _attributes: {
      BlockTime: String(data.blockTime),
      OriginPermission: booleanToXml(data.originPermission),
      DestinationPermission: booleanToXml(data.destinationPermission),
      Std: String(data.std)
    },
    StdBoundaries: {
      StdBoundary: data.stdBoundaries.map(convertStdBoundaryModelToEntity)
    }
  };
}
export function convertDayFlightRequirementLegEntityToModel(data: DayFlightRequirementLegEntity): DayFlightRequirementLegModel {
  return {
    blockTime: Number(data._attributes.BlockTime),
    stdBoundaries: xmlArray(data.StdBoundaries.StdBoundary).map(convertStdBoundaryEntityToModel),
    originPermission: xmlToBoolean(data._attributes.OriginPermission),
    destinationPermission: xmlToBoolean(data._attributes.DestinationPermission),
    std: Number(data._attributes.Std)
  };
}
