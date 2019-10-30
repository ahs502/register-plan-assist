/**
 * The list of how every aircraft register is treated within each preplan.
 */
export const AircraftRegisterOptionsStatuses = <const>['IGNORED', 'BACKUP', 'INCLUDED'];

/**
 * How every aircraft register is treated within each preplan.
 */
type AircraftRegisterOptionsStatus = typeof AircraftRegisterOptionsStatuses[number];

export default AircraftRegisterOptionsStatus;
