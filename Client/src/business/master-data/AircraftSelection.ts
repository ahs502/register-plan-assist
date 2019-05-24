/**
 * A data structure describing a range of aircraft registers.
 * An aircraft is within this range if and only if it is included
 * in at least one of the allowed aircraft identities while it is not
 * included in any of the forbidden aircraft identities.
 */
export default interface AircraftSelection {
  readonly allowedIdentities: AircraftIdentity[];
  readonly forbiddenIdentities: AircraftIdentity[];
}
