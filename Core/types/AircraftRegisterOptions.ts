/**
 * How every aircraft register is treated within each preplan.
 */
export type AircraftRegisterStatus = 'IGNORED' | 'BACKUP' | 'INCLUDED';

/**
 * The selected options for an aircraft register in a preplan.
 */
export default interface AircraftRegisterOptions {
  readonly status: AircraftRegisterStatus;
  readonly startingAirportId: string;
}

/**
 * A dictionary of aircraft register options by their id values.
 */
export interface AircraftRegisterOptionsDictionary {
  readonly [id: string]: AircraftRegisterOptions;
}
