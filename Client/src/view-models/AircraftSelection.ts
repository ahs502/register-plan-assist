import AircraftIdentity from './AircraftIdentity';
import AircraftSelectionModel from '@core/models/AircraftSelectionModel';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from './PreplanAircraftRegister';

/**
 * A data structure describing a range of aircraft registers.
 * An aircraft is within this range if and only if it is included
 * in at least one of the allowed aircraft identities while it is not
 * included in any of the forbidden aircraft identities.
 */
export default class AircraftSelection {
  readonly allowedIdentities: readonly AircraftIdentity[];
  readonly forbiddenIdentities: readonly AircraftIdentity[];

  constructor(raw: AircraftSelectionModel, aircraftRegisters: PreplanAircraftRegisters) {
    this.allowedIdentities = raw.allowedIdentities.map(i => AircraftIdentity.parse(i, aircraftRegisters));
    this.forbiddenIdentities = raw.forbiddenIdentities.map(i => AircraftIdentity.parse(i, aircraftRegisters));
  }

  /**
   * Returns all allowed and included corresponding preplan aircraft registers.
   */
  resolveIncluded(): readonly PreplanAircraftRegister[] {
    const allowed = new Set<PreplanAircraftRegister>();
    this.allowedIdentities.forEach(i => i.resolve().forEach(r => allowed.add(r)));
    this.forbiddenIdentities.forEach(i => i.resolve().forEach(r => allowed.delete(r)));
    return Array.from(allowed).filter(r => r.options.status === 'INCLUDED');
  }

  /**
   * Returns one weak-corresponding preplan aircraft register as backup if possible.
   */
  resolveBackup(): PreplanAircraftRegister | undefined {
    const all = new Set<PreplanAircraftRegister>();
    this.allowedIdentities.forEach(i => i.resolve().forEach(r => all.add(r)));
    const allowed = new Set(all);
    this.forbiddenIdentities.forEach(i => i.resolve().forEach(r => allowed.delete(r)));
    if (allowed.size) return allowed.values().next().value;
    if (all.size) return all.values().next().value;
    return undefined;
  }
}
