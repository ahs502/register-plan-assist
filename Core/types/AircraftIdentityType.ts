/**
 * All possible aircraft identity types.
 */
export const AircraftIdentityTypes = <const>['REGISTER', 'TYPE', 'TYPE_EXISTING', 'TYPE_DUMMY', 'GROUP'];

/**
 * Aircraft identity type.
 */
type AircraftIdentityType = typeof AircraftIdentityTypes[number];

export default AircraftIdentityType;
