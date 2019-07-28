/**
 * The list of how every aircraft register is treated within each preplan.
 */
export const AircraftRegisterStatuses = <const>['IGNORED', 'BACKUP', 'INCLUDED'];

/**
 * How every aircraft register is treated within each preplan.
 */
type AircraftRegisterStatus = typeof AircraftRegisterStatuses[number];

export default AircraftRegisterStatus;
