import { AircraftTypes, AircraftTypeModel } from './AircraftType';
import { AircraftRegisters, AircraftRegisterModel } from './AircraftRegister';
import { Airports, AirportModel } from './Airport';
import { SeasonTypes, SeasonTypeModel } from './SeasonType';
import { Seasons, SeasonModel } from './Season';
import { Stcs, StcModel } from './Stc';
import { AircraftGroups, AircraftGroupModel } from './AircraftGroup';
import { Constraints, ConstraintModel } from './Constraint';

import { AircraftIdentity } from './AircraftSelection';

export interface MasterDataModel {
  aircraftTypes: Readonly<AircraftTypeModel>[];
  aircraftRegisters: Readonly<AircraftRegisterModel>[];
  airports: Readonly<AirportModel>[];
  seasonTypes: Readonly<SeasonTypeModel>[];
  seasons: Readonly<SeasonModel>[];
  stcs: Readonly<StcModel>[];
  aircraftGroups: Readonly<AircraftGroupModel>[];
  constraints: Readonly<ConstraintModel>[];
}

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
  readonly aircraftIdentities: Readonly<AircraftIdentity>[];

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
   * @param raw A JSON object containing partially the raw retrieved data for some/all master data collections.
   */
  static recieve(raw: Partial<MasterDataModel>) {
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
