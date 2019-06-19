/**
 * All possible kinds of aircraft identities.
 */
export type AircraftIdentityType = 'REGISTER' | 'TYPE' | 'TYPE_EXISTING' | 'TYPE_DUMMY' | 'GROUP';

/**
 * A representive object identifying one or more aircraft registers
 * by pointing to a specific item in master data.
 */
export default interface AircraftIdentity {
  readonly type: AircraftIdentityType;
  readonly name: string;
  readonly entityId: string;
}
