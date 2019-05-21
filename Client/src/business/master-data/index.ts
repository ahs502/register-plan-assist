import { AircraftTypes } from './AircraftType';
import { AircraftRegisters } from './AircraftRegister';
import { Airports } from './Airport';
import { SeasonTypes } from './SeasonType';
import { Seasons } from './Season';
import { Stcs } from './Stc';
import { AircraftGroups } from './AircraftGroup';
import { Constraints } from './Constraint';

/**
 * The global master data collection object.
 */
var masterData = {
  aircraftTypes: new AircraftTypes([]),
  aircraftRegisters: new AircraftRegisters([]),
  airports: new Airports([]),
  seasonTypes: new SeasonTypes([]),
  seasons: new Seasons([]),
  stcs: new Stcs([]),
  aircraftGroups: new AircraftGroups([]),
  constraints: new Constraints([])
};

/**
 * Parses the retrieved raw data for master data collections.
 * @param data A JSON object containing the raw retrieved data for some/all master data collections.
 */
export function receive(data: any) {
  masterData.aircraftTypes = AircraftTypes.parse(data['aircraftTypes']) || masterData.aircraftTypes;
  masterData.aircraftRegisters = AircraftRegisters.parse(data['aircraftRegisters']) || masterData.aircraftRegisters;
  masterData.airports = Airports.parse(data['airports']) || masterData.airports;
  masterData.seasonTypes = SeasonTypes.parse(data['seasonTypes']) || masterData.seasonTypes;
  masterData.seasons = Seasons.parse(data['seasons']) || masterData.seasons;
  masterData.stcs = Stcs.parse(data['stcs']) || masterData.stcs;
  masterData.aircraftGroups = AircraftGroups.parse(data['aircraftGroups']) || masterData.aircraftGroups;
  masterData.constraints = Constraints.parse(data['constraints']) || masterData.constraints;
}

export default masterData;
