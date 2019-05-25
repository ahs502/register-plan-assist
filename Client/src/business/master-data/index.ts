import { AircraftTypes } from './AircraftType';
import { AircraftRegisters } from './AircraftRegister';
import { Airports } from './Airport';
import { SeasonTypes } from './SeasonType';
import { Seasons } from './Season';
import { Stcs } from './Stc';
import { AircraftGroups } from './AircraftGroup';
import { Constraints } from './Constraint';

import { AircraftIdentity } from './AircraftSelection';

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
  readonly aircraftIdentities: AircraftIdentity[];

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
      .concat(this.aircraftRegisters.items.map(a => ({ type: 'register', name: a.name, entityId: a.id })))
      .concat(this.aircraftTypes.items.map(a => ({ type: 'type', name: a.name, entityId: a.id })))
      .concat(this.aircraftTypes.items.map(a => ({ type: 'type existing', name: a.name + '_EXISTING', entityId: a.id })))
      .concat(this.aircraftTypes.items.map(a => ({ type: 'type dummy', name: a.name + '_DUMMY', entityId: a.id })))
      .concat(this.aircraftGroups.items.map(a => ({ type: 'group', name: a.name, entityId: a.id })));
  }

  /**
   * Parses the retrieved raw data for master data collections.
   * @param data A JSON object containing partially the raw retrieved data for some/all master data collections.
   */
  static recieve(data: any) {
    MasterData.all = new MasterData(
      AircraftTypes.parse(data['aircraftTypes']) || MasterData.all.aircraftTypes,
      AircraftRegisters.parse(data['aircraftRegisters']) || MasterData.all.aircraftRegisters,
      Airports.parse(data['airports']) || MasterData.all.airports,
      SeasonTypes.parse(data['seasonTypes']) || MasterData.all.seasonTypes,
      Seasons.parse(data['seasons']) || MasterData.all.seasons,
      Stcs.parse(data['stcs']) || MasterData.all.stcs,
      AircraftGroups.parse(data['aircraftGroups']) || MasterData.all.aircraftGroups,
      Constraints.parse(data['constraints']) || MasterData.all.constraints
    );
  }

  /**
   * The singleton object containing all master data collections data.
   */
  static all: MasterData = new MasterData(
    AircraftTypes.parse([]) as AircraftTypes,
    AircraftRegisters.parse([]) as AircraftRegisters,
    Airports.parse([]) as Airports,
    SeasonTypes.parse([]) as SeasonTypes,
    Seasons.parse([]) as Seasons,
    Stcs.parse([]) as Stcs,
    AircraftGroups.parse([]) as AircraftGroups,
    Constraints.parse([]) as Constraints
  );
}
