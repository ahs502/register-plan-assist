/**
 * All possible kinds of aircraft identity.
 */
export type AircraftIdentityType = 'register' | 'type' | 'type existing' | 'type dummy' | 'group';

/**
 * A representive object identifying one or more aircraft registers
 * by pointing to a specific item in master data.
 */
export default interface AircraftIdentity {
  readonly type: AircraftIdentityType;
  readonly name: string;
  readonly entityId: string;
}
