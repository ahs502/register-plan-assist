import IClonable from '../utils/IClonable';
import AircraftIdentity from './AircraftIdentity';
import AircraftRegister from './master-data/AircraftRegister';

/**
 * A data structure describing a range of aircraft registers.
 * An aircraft is within this range if and only if it is included
 * in at least one of the allowed aircraft identities while it is not
 * included in any of the forbidden aircraft identities.
 */
export default class AircraftSelection implements IClonable<AircraftSelection> {
  allowedIdentities: AircraftIdentity[];
  forbiddenIdentities: AircraftIdentity[];

  constructor(allowedIdentities?: AircraftIdentity[], forbiddenIdentities?: AircraftIdentity[]) {
    this.allowedIdentities = allowedIdentities || [];
    this.forbiddenIdentities = forbiddenIdentities || [];
  }

  clone(): AircraftSelection {
    return new AircraftSelection(this.allowedIdentities.map(d => d.clone()), this.forbiddenIdentities.map(d => d.clone()));
  }

  /**
   * Returns the list of all the included aircraft registers within this object.
   */
  getAircraftRegisters(): AircraftRegister[] {
    let allowedRegisters: AircraftRegister[] = [];
    this.allowedIdentities.forEach(d => (allowedRegisters = allowedRegisters.concat(d.getAircraftRegisters())));

    let forbiddenRegisters: AircraftRegister[] = [];
    this.forbiddenIdentities.forEach(d => (forbiddenRegisters = forbiddenRegisters.concat(d.getAircraftRegisters())));

    return allowedRegisters.filter(r => !forbiddenRegisters.includes(r));
  }
}
