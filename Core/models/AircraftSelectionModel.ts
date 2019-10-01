import AircraftIdentityModel from './AircraftIdentityModel';

export default interface AircraftSelectionModel {
  readonly includedIdentities: readonly AircraftIdentityModel[];
  readonly excludedIdentities: readonly AircraftIdentityModel[];
}
