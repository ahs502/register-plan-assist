import AircraftSelectionModel from '@core/models/AircraftSelectionModel';
import AircraftIdentity from './AircraftIdentity';
import { AircraftRegisters } from './AircraftRegister';
import { AircraftTypes } from './AircraftType';
import { AircraftGroups } from './AircraftGroup';

/**
 * A data structure describing a range of aircraft registers.
 * An aircraft is within this range if and only if it is included
 * in at least one of the allowed aircraft identities while it is not
 * included in any of the forbidden aircraft identities.
 */
export default class AircraftSelection {
  readonly allowedIdentities: readonly AircraftIdentity[];
  readonly forbiddenIdentities: readonly AircraftIdentity[];

  constructor(raw: AircraftSelectionModel, aircraftRegisters: AircraftRegisters, aircraftTypes: AircraftTypes, aircraftGroups: AircraftGroups) {
    this.allowedIdentities = raw.allowedIdentities.map(i => new AircraftIdentity(i, aircraftRegisters, aircraftTypes, aircraftGroups));
    this.forbiddenIdentities = raw.forbiddenIdentities.map(i => new AircraftIdentity(i, aircraftRegisters, aircraftTypes, aircraftGroups));
  }
}
