import { FlightScopeModel } from '@core/models/flights/FlightScopeModel';
import Rsx from '@core/types/flight-requirement/Rsx';
import { XmlArray, xmlArray } from 'src/utils/xml';
import FlightTimeEntity, { convertFlightTimeEntityToModel, convertFlightTimeModelToEntity } from './FlightTimeEntity';
import AircraftIdentityEntity, { convertAircraftIdentityModelToEntity, convertAircraftIdentityEntityToModel } from '../AircraftIdentityEntity';

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
  readonly AircraftSelection: {
    readonly AllowedIdentities: {
      readonly AllowedIdentity: XmlArray<AircraftIdentityEntity>;
    };
    readonly ForbiddenIdentities: {
      readonly ForbiddenIdentity: XmlArray<AircraftIdentityEntity>;
    };
  };
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
    AircraftSelection: {
      AllowedIdentities: {
        AllowedIdentity: data.aircraftSelection.allowedIdentities.map(convertAircraftIdentityModelToEntity)
      },
      ForbiddenIdentities: {
        ForbiddenIdentity: data.aircraftSelection.forbiddenIdentities.map(convertAircraftIdentityModelToEntity)
      }
    }
  };
}

export function convertflightScopeEntityToModel(data: FlightScopeEntity): FlightScopeModel {
  console.log(data);
  return {
    blockTime: Number(data._attributes.BlockTime),
    times: xmlArray(data.Times.Time).map(convertFlightTimeEntityToModel),
    aircraftSelection: {
      allowedIdentities: xmlArray(data.AircraftSelection.AllowedIdentities.AllowedIdentity).map(convertAircraftIdentityEntityToModel),
      forbiddenIdentities: xmlArray(data.AircraftSelection.ForbiddenIdentities.ForbiddenIdentity).map(convertAircraftIdentityEntityToModel)
    },
    originPermission: Boolean(data._attributes.OriginPermission),
    destinationPermission: Boolean(data._attributes.DestinationPermission),
    rsx: data._attributes.Rsx as Rsx,
    required: Boolean(data._attributes.Required)
  };
}
