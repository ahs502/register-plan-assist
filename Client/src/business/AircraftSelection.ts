import IClonable from '../utils/IClonable';
import AircraftIdentity from './AircraftIdentity';
import AircraftRegister from './master-data/AircraftRegister';

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

  getAircraftRegisters(): AircraftRegister[] {
    let allowedRegisters: AircraftRegister[] = [];
    this.allowedIdentities.forEach(d => (allowedRegisters = allowedRegisters.concat(d.getAircraftRegisters())));

    let forbiddenRegisters: AircraftRegister[] = [];
    this.forbiddenIdentities.forEach(d => (forbiddenRegisters = forbiddenRegisters.concat(d.getAircraftRegisters())));

    return allowedRegisters.filter(r => !forbiddenRegisters.includes(r));
  }
}
