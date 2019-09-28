import FlightScopeModel from '@core/models/flights/FlightScopeModel';
import Rsx from '@core/types/flight-requirement/Rsx';
import { XmlArray, xmlArray } from 'src/utils/xml';
import FlightTimeEntity, { convertFlightTimeEntityToModel, convertFlightTimeModelToEntity } from './FlightTimeEntity';
import AircraftSelectionEntity, { convertAircraftSelectionModelToEntity, convertAircraftSelectionEntityToModel } from '../AircraftSelectionEntity';

export default interface FlightScopeEntity {
  readonly _attributes: {
    readonly BlockTime: string;
    readonly OriginPermission: string;
    readonly DestinationPermission: string;
    readonly Required: string;
    readonly Rsx: string;
  };
  readonly Times: {
    readonly Time: XmlArray<FlightTimeEntity>;
  };
  readonly AircraftSelection: AircraftSelectionEntity;
}

export function convertFlightScopeModelToEntity(data: FlightScopeModel): FlightScopeEntity {
  return {
    _attributes: {
      BlockTime: String(data.blockTime),
      OriginPermission: String(data.originPermission),
      DestinationPermission: String(data.destinationPermission),
      Required: String(data.required),
      Rsx: data.rsx
    },
    Times: {
      Time: data.times.map(convertFlightTimeModelToEntity)
    },
    AircraftSelection: convertAircraftSelectionModelToEntity(data.aircraftSelection)
  };
}

export function convertflightScopeEntityToModel(data: FlightScopeEntity): FlightScopeModel {
  return {
    blockTime: Number(data._attributes.BlockTime),
    times: xmlArray(data.Times.Time).map(convertFlightTimeEntityToModel),
    aircraftSelection: convertAircraftSelectionEntityToModel(data.AircraftSelection),
    originPermission: data._attributes.OriginPermission === 'true',
    destinationPermission: data._attributes.DestinationPermission === 'true',
    rsx: data._attributes.Rsx as Rsx,
    required: data._attributes.Required === 'true'
  };
}
