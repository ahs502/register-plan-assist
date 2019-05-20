import AircraftType, { AircraftTypes } from './AircraftType';
import AircraftRegister, { AircraftRegisters } from './AircraftRegister';
import Airport, { Airports } from './Airport';
import SeasonType, { SeasonTypes } from './SeasonType';
import Season, { Seasons } from './Season';
import Stc, { Stcs } from './Stc';
import AircraftGroup, { AircraftGroups } from './AircraftGroup';
import Constraint, { Constraints } from './Constraint';

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
