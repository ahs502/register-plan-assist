import * as xmlJson from 'xml-js';
import { FlightScopeModel } from '@core/models/flights/FlightScopeModel';
import Rsx from '@core/types/flight-requirement/Rsx';
import AircraftIdentityType from '@core/types/aircraft-identity/AircraftIdentityType';

export default interface FlightScopeEntity {
  readonly _attributes: {
    readonly BlockTime: string;
    readonly OriginPermission: string;
    readonly DestinationPermission: string;
    readonly Required: string;
    readonly Rsx: string;
  };
  readonly Times: {
    readonly Time: readonly {
      readonly StdLowerBound: string;
      readonly StdUpperBound: string;
    }[];
  };
  readonly AllowedIdentities: {
    readonly AllowedIdentity: readonly {
      readonly _attributes: {
        readonly Type: string;
        readonly Id_Entity: string;
      };
    }[];
  };
  readonly ForbiddenIdentities: {
    readonly ForbiddenIdentity: readonly {
      readonly _attributes: {
        readonly Type: string;
        readonly Id_Entity: string;
      };
    }[];
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
      Time: data.times.map(t => ({
        StdLowerBound: String(t.stdLowerBound),
        StdUpperBound: String(t.stdUpperBound)
      }))
    },
    AllowedIdentities: {
      AllowedIdentity: data.aircraftSelection.allowedIdentities.map(i => ({
        _attributes: {
          Type: i.type,
          Id_Entity: i.entityId
        }
      }))
    },
    ForbiddenIdentities: {
      ForbiddenIdentity: data.aircraftSelection.forbiddenIdentities.map(i => ({
        _attributes: {
          Type: i.type,
          Id_Entity: i.entityId
        }
      }))
    }
  };
}

export function convertflightScopeEntityToModel(data: FlightScopeEntity): FlightScopeModel {
  return {
    blockTime: Number(data._attributes.BlockTime),
    times: data.Times.Time.map(t => ({
      stdLowerBound: Number(t.StdLowerBound),
      stdUpperBound: Number(t.StdUpperBound)
    })),
    aircraftSelection: {
      allowedIdentities: data.AllowedIdentities.AllowedIdentity.map(i => ({
        type: i._attributes.Type as AircraftIdentityType,
        entityId: i._attributes.Id_Entity
      })),
      forbiddenIdentities: data.ForbiddenIdentities.ForbiddenIdentity.map(i => ({
        type: i._attributes.Type as AircraftIdentityType,
        entityId: i._attributes.Id_Entity
      }))
    },
    originPermission: Boolean(data._attributes.OriginPermission),
    destinationPermission: Boolean(data._attributes.DestinationPermission),
    rsx: data._attributes.Rsx as Rsx,
    required: Boolean(data._attributes.Required)
  };
}
