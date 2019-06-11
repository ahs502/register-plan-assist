/**
 * All possible kinds of aircraft identities.
 */
export type AircraftIdentityType = 'REGISTER' | 'TYPE' | 'TYPE_EXISTING' | 'TYPE_DUMMY' | 'GROUP';

/**
 * A representive object identifying one or more aircraft registers
 * by pointing to a specific item in master data.
 */
export interface AircraftIdentity {
  type: AircraftIdentityType;
  name: string;
  entityId: string;
}

/**
 * A data structure describing a range of aircraft registers.
 * An aircraft is within this range if and only if it is included
 * in at least one of the allowed aircraft identities while it is not
 * included in any of the forbidden aircraft identities.
 */
export default interface AircraftSelection {
  allowedIdentities: ReadonlyArray<Readonly<AircraftIdentity>>;
  forbiddenIdentities: ReadonlyArray<Readonly<AircraftIdentity>>;
}
