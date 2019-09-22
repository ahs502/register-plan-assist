import MasterDataModel from '@core/models/master-data/MasterDataModel';
// import AircraftIdentity from '@core/../Client/src/view-models/AircraftIdentity';

import { AircraftTypes } from './AircraftType';
import { AircraftRegisters } from './AircraftRegister';
import { Airports } from './Airport';
import { SeasonTypes } from './SeasonType';
import { Seasons } from './Season';
import { Stcs } from './Stc';
import { AircraftRegisterGroups } from './AircraftRegisterGroup';
import { ConstraintTemplates } from './ConstraintTemplate';
import { Constraints } from './Constraint';

/**
 * The global master data collection containter.
 * It is a singleton class with a static property all.
 */
export default class MasterData {
  readonly aircraftTypes: AircraftTypes;
  readonly aircraftRegisters: AircraftRegisters;
  readonly airports: Airports;
  readonly seasonTypes: SeasonTypes;
  readonly seasons: Seasons;
  readonly stcs: Stcs;
  readonly aircraftRegisterGroups: AircraftRegisterGroups;
  readonly constraintTemplates: ConstraintTemplates;
  readonly constraints: Constraints;

  // /**
  //  * All available aircraft identifiers for master data declarations,
  //  * including all aircraft registers/types/groups by their names and
  //  * all existing or dummy portion of each aircraft types by their names
  //  * followed by a '&lowbar;EXISTING' or '&lowbar;DUMMY' postfix.
  //  */
  // readonly aircraftIdentities: readonly AircraftIdentity[];

  private constructor(
    aircraftTypes: AircraftTypes,
    aircraftRegisters: AircraftRegisters,
    airports: Airports,
    seasonTypes: SeasonTypes,
    seasons: Seasons,
    stcs: Stcs,
    aircraftRegisterGroups: AircraftRegisterGroups,
    constraintTemplates: ConstraintTemplates,
    constraints: Constraints
  ) {
    this.aircraftTypes = aircraftTypes;
    this.aircraftRegisters = aircraftRegisters;
    this.airports = airports;
    this.seasonTypes = seasonTypes;
    this.seasons = seasons;
    this.stcs = stcs;
    this.aircraftRegisterGroups = aircraftRegisterGroups;
    this.constraintTemplates = constraintTemplates;
    this.constraints = constraints;

    // this.aircraftIdentities = ([] as AircraftIdentity[])
    //   .concat(this.aircraftRegisters.items.map(a => ({ type: 'REGISTER', name: a.name, entityId: a.id })))
    //   .concat(this.aircraftTypes.items.map(a => ({ type: 'TYPE', name: a.name, entityId: a.id })))
    //   .concat(this.aircraftTypes.items.map(a => ({ type: 'TYPE_EXISTING', name: a.name + '_EXISTING', entityId: a.id })))
    //   .concat(this.aircraftTypes.items.map(a => ({ type: 'TYPE_DUMMY', name: a.name + '_DUMMY', entityId: a.id })))
    //   .concat(this.aircraftRegisterGroups.items.map(a => ({ type: 'GROUP', name: a.name, entityId: a.id })));
  }

  /**
   * Parses the retrieved raw data for master data collections.
   * @param raw A JSON object containing partially the raw retrieved data for some/all master data collections.
   */
  static recieve(raw: MasterDataModel) {
    const aircraftTypes = AircraftTypes.parse(raw.aircraftTypes) || MasterData.all.aircraftTypes;
    const aircraftRegisters = AircraftRegisters.parse(aircraftTypes, raw.aircraftRegisters) || MasterData.all.aircraftRegisters;
    const airports = Airports.parse(raw.airports) || MasterData.all.airports;
    const seasonTypes = SeasonTypes.parse(raw.seasonTypes) || MasterData.all.seasonTypes;
    const seasons = Seasons.parse(seasonTypes, raw.seasons) || MasterData.all.seasons;
    const stcs = Stcs.parse(raw.stcs) || MasterData.all.stcs;
    const aircraftRegisterGroups = AircraftRegisterGroups.parse(aircraftRegisters, raw.aircraftRegisterGroups) || MasterData.all.aircraftRegisterGroups;
    const constraintTemplates = ConstraintTemplates.parse(raw.constraintTemplates) || MasterData.all.constraintTemplates;
    const constraints =
      Constraints.parse(constraintTemplates, airports, aircraftRegisters, aircraftTypes, aircraftRegisterGroups, seasonTypes, raw.constraints) || MasterData.all.constraints;

    MasterData.all = new MasterData(aircraftTypes, aircraftRegisters, airports, seasonTypes, seasons, stcs, aircraftRegisterGroups, constraintTemplates, constraints);
  }

  /**
   * The singleton object containing all master data collections data.
   */
  static all: MasterData = (() => {
    const aircraftTypes = AircraftTypes.parse([])!;
    const aircraftRegisters = AircraftRegisters.parse(aircraftTypes, [])!;
    const airports = Airports.parse([])!;
    const seasonTypes = SeasonTypes.parse([])!;
    const seasons = Seasons.parse(seasonTypes, [])!;
    const stcs = Stcs.parse([])!;
    const aircraftRegisterGroups = AircraftRegisterGroups.parse(aircraftRegisters, [])!;
    const constraintTemplates = ConstraintTemplates.parse([])!;
    const constraints = Constraints.parse(constraintTemplates, airports, aircraftRegisters, aircraftTypes, aircraftRegisterGroups, seasonTypes, [])!;

    return new MasterData(aircraftTypes, aircraftRegisters, airports, seasonTypes, seasons, stcs, aircraftRegisterGroups, constraintTemplates, constraints);
  })();
}
