import PreplanAircraftIdentity from './PreplanAircraftIdentity';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from './PreplanAircraftRegister';
import AircraftSelectionModel from '@core/models/AircraftSelectionModel';
import ModelConvertable, { getOverridedArray } from 'src/utils/ModelConvertable';
import DeepWritablePartial from '@core/types/DeepWritablePartial';

/**
 * A data structure describing a range of aircraft registers.
 * An aircraft is within this range if and only if it is included
 * in at least one of the allowed aircraft identities while it is not
 * included in any of the forbidden aircraft identities.
 */
export default class PreplanAircraftSelection implements ModelConvertable<AircraftSelectionModel> {
  readonly allowedIdentities: readonly PreplanAircraftIdentity[];
  readonly forbiddenIdentities: readonly PreplanAircraftIdentity[];

  // Computational:
  /** All allowed and included corresponding preplan aircraft registers. */ readonly aircraftRegisters: readonly PreplanAircraftRegister[];
  /** One weak-corresponding preplan aircraft register as backup if exists. */ readonly backupAircraftRegister?: PreplanAircraftRegister;

  constructor(raw: AircraftSelectionModel, aircraftRegisters: PreplanAircraftRegisters) {
    this.allowedIdentities = raw.allowedIdentities.map(i => PreplanAircraftIdentity.parse(i, aircraftRegisters));
    this.forbiddenIdentities = raw.forbiddenIdentities.map(i => PreplanAircraftIdentity.parse(i, aircraftRegisters));

    let allowed = new Set<PreplanAircraftRegister>();
    this.allowedIdentities.forEach(i => i.aircraftRegisters.forEach(r => allowed.add(r)));
    this.forbiddenIdentities.forEach(i => i.aircraftRegisters.forEach(r => allowed.delete(r)));
    this.aircraftRegisters = Array.from(allowed).filter(r => r.options.status === 'INCLUDED');

    const all = new Set<PreplanAircraftRegister>();
    this.allowedIdentities.forEach(i => i.aircraftRegisters.forEach(r => all.add(r)));
    allowed = new Set(all);
    this.forbiddenIdentities.forEach(i => i.aircraftRegisters.forEach(r => allowed.delete(r)));
    this.backupAircraftRegister = allowed.size ? allowed.values().next().value : all.size ? all.values().next().value : undefined;
  }

  extractModel(overrides?: DeepWritablePartial<AircraftSelectionModel>): AircraftSelectionModel {
    return {
      allowedIdentities: getOverridedArray(this.allowedIdentities, overrides, 'allowedIdentities'),
      forbiddenIdentities: getOverridedArray(this.forbiddenIdentities, overrides, 'forbiddenIdentities')
    };
  }

  getMinimumGroundTime(transit: boolean, international: boolean, startDate: Date, endDate?: Date, method: 'MAXIMUM' | 'MINIMUM' = 'MAXIMUM'): number {
    const minimumGroundTimes = this.aircraftRegisters.map(a => a.getMinimumGroundTime(transit, international, startDate, endDate, method));
    if (minimumGroundTimes.length === 0) return 0;
    return method === 'MAXIMUM' ? Math.max(...minimumGroundTimes) : Math.min(...minimumGroundTimes);
  }
}
