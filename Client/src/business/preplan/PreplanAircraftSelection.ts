import PreplanAircraftIdentity from './PreplanAircraftIdentity';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from './PreplanAircraftRegister';
import AircraftSelectionModel from '@core/models/AircraftSelectionModel';
import ModelConvertable, { getOverridedArray } from 'src/business/ModelConvertable';
import DeepWritablePartial from '@core/types/DeepWritablePartial';
import { AircraftSelection } from '@core/master-data';

/**
 * A data structure describing a range of aircraft registers.
 * An aircraft is within this range if and only if it is included
 * in at least one of the included aircraft identities while it is not
 * included in any of the excluded aircraft identities.
 */
export default class PreplanAircraftSelection implements ModelConvertable<AircraftSelectionModel> {
  readonly includedIdentities: readonly PreplanAircraftIdentity[];
  readonly excludedIdentities: readonly PreplanAircraftIdentity[];

  // Computational:
  /** All included and included corresponding preplan aircraft registers. */ readonly aircraftRegisters: readonly PreplanAircraftRegister[];
  /** One weak-corresponding preplan aircraft register as backup if exists. */ readonly backupAircraftRegister?: PreplanAircraftRegister;

  constructor(raw: AircraftSelectionModel | AircraftSelection, aircraftRegisters: PreplanAircraftRegisters) {
    if (raw instanceof AircraftSelection) {
      this.includedIdentities = raw.includedIdentities.map(i => PreplanAircraftIdentity.parse(i, aircraftRegisters));
      this.excludedIdentities = raw.excludedIdentities.map(i => PreplanAircraftIdentity.parse(i, aircraftRegisters));
    } else {
      this.includedIdentities = raw.includedIdentities.map(i => PreplanAircraftIdentity.parse(i, aircraftRegisters));
      this.excludedIdentities = raw.excludedIdentities.map(i => PreplanAircraftIdentity.parse(i, aircraftRegisters));
    }

    let included = new Set<PreplanAircraftRegister>();
    this.includedIdentities.forEach(i => i.aircraftRegisters.forEach(r => included.add(r)));
    this.excludedIdentities.forEach(i => i.aircraftRegisters.forEach(r => included.delete(r)));
    const includedAircraftRegisters = Array.from(included);
    this.aircraftRegisters = includedAircraftRegisters.filter(r => r.options.status === 'INCLUDED');
    this.backupAircraftRegister =
      includedAircraftRegisters.find(r => r.options.status === 'INCLUDED') || includedAircraftRegisters.find(r => r.options.status === 'BACKUP') || undefined;
  }

  extractModel(overrides?: DeepWritablePartial<AircraftSelectionModel>): AircraftSelectionModel {
    return {
      includedIdentities: getOverridedArray(this.includedIdentities, overrides, 'includedIdentities'),
      excludedIdentities: getOverridedArray(this.excludedIdentities, overrides, 'excludedIdentities')
    };
  }

  getMinimumGroundTime(transit: boolean, international: boolean, startDate: Date, endDate?: Date, method: 'MAXIMUM' | 'MINIMUM' = 'MAXIMUM'): number {
    const minimumGroundTimes = this.aircraftRegisters.map(a => a.getMinimumGroundTime(transit, international, startDate, endDate, method));
    if (minimumGroundTimes.length === 0) return 0;
    return method === 'MAXIMUM' ? Math.max(...minimumGroundTimes) : Math.min(...minimumGroundTimes);
  }
}
