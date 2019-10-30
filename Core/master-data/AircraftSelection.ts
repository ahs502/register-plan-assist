import AircraftSelectionModel from '@core/models/AircraftSelectionModel';
import AircraftIdentity from './AircraftIdentity';
import { AircraftRegisters } from './AircraftRegister';
import { AircraftTypes } from './AircraftType';
import { AircraftRegisterGroups } from './AircraftRegisterGroup';

/**
 * A data structure describing a range of aircraft registers.
 * An aircraft is within this range if and only if it is included
 * in at least one of the included aircraft identities while it is not
 * included in any of the excluded aircraft identities.
 */
export default class AircraftSelection {
  readonly includedIdentities: readonly AircraftIdentity[];
  readonly excludedIdentities: readonly AircraftIdentity[];

  constructor(raw: AircraftSelectionModel, aircraftRegisters: AircraftRegisters, aircraftTypes: AircraftTypes, aircraftRegisterGroups: AircraftRegisterGroups) {
    this.includedIdentities = raw.includedIdentities.map(i => new AircraftIdentity(i, aircraftRegisters, aircraftTypes, aircraftRegisterGroups));
    this.excludedIdentities = raw.excludedIdentities.map(i => new AircraftIdentity(i, aircraftRegisters, aircraftTypes, aircraftRegisterGroups));
  }
}
