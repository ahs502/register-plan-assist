import MasterDataModel from '../models/master-data/MasterDataModel';
import AircraftIdentity from '../types/AircraftIdentity';

import { AircraftTypes } from './AircraftType';
import { AircraftRegisters } from './AircraftRegister';
import { Airports } from './Airport';
import { SeasonTypes } from './SeasonType';
import { Seasons } from './Season';
import { Stcs } from './Stc';
import { AircraftGroups } from './AircraftGroup';
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
  readonly aircraftGroups: AircraftGroups;
  readonly constraints: Constraints;

  /**
   * All available aircraft identifiers for master data declarations,
   * including all aircraft registers/types/groups by their names and
   * all existing or dummy portion of each aircraft types by their names
   * followed by a '&lowbar;EXISTING' or '&lowbar;DUMMY' postfix.
   */
  readonly aircraftIdentities: readonly AircraftIdentity[];

  private constructor(
    aircraftTypes: AircraftTypes,
    aircraftRegisters: AircraftRegisters,
    airports: Airports,
    seasonTypes: SeasonTypes,
    seasons: Seasons,
    stcs: Stcs,
    aircraftGroups: AircraftGroups,
    constraints: Constraints
  ) {
    this.aircraftTypes = aircraftTypes;
    this.aircraftRegisters = aircraftRegisters;
    this.airports = airports;
    this.seasonTypes = seasonTypes;
    this.seasons = seasons;
    this.stcs = stcs;
    this.aircraftGroups = aircraftGroups;
    this.constraints = constraints;

    this.aircraftIdentities = ([] as AircraftIdentity[])
      .concat(this.aircraftRegisters.items.map(a => ({ type: 'REGISTER', name: a.name, entityId: a.id })))
      .concat(this.aircraftTypes.items.map(a => ({ type: 'TYPE', name: a.name, entityId: a.id })))
      .concat(this.aircraftTypes.items.map(a => ({ type: 'TYPE_EXISTING', name: a.name + '_EXISTING', entityId: a.id })))
      .concat(this.aircraftTypes.items.map(a => ({ type: 'TYPE_DUMMY', name: a.name + '_DUMMY', entityId: a.id })))
      .concat(this.aircraftGroups.items.map(a => ({ type: 'GROUP', name: a.name, entityId: a.id })));
  }

  /**
   * Parses the retrieved raw data for master data collections.
   * @param raw A JSON object containing partially the raw retrieved data for some/all master data collections.
   */
  static recieve(raw: MasterDataModel) {
    MasterData.all = new MasterData(
      AircraftTypes.parse(raw.aircraftTypes) || MasterData.all.aircraftTypes,
      AircraftRegisters.parse(raw.aircraftRegisters) || MasterData.all.aircraftRegisters,
      Airports.parse(raw.airports) || MasterData.all.airports,
      SeasonTypes.parse(raw.seasonTypes) || MasterData.all.seasonTypes,
      Seasons.parse(raw.seasons) || MasterData.all.seasons,
      Stcs.parse(raw.stcs) || MasterData.all.stcs,
      AircraftGroups.parse(raw.aircraftGroups) || MasterData.all.aircraftGroups,
      Constraints.parse(raw.constraints) || MasterData.all.constraints
    );
  }

  /**
   * The singleton object containing all master data collections data.
   */
  static all: MasterData = new MasterData(
    AircraftTypes.parse([])!,
    AircraftRegisters.parse([])!,
    Airports.parse([])!,
    SeasonTypes.parse([])!,
    Seasons.parse([])!,
    Stcs.parse([])!,
    AircraftGroups.parse([])!,
    Constraints.parse([])!
  );
}
