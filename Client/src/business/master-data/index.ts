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
  if (data['aircraftTypes']) masterData.aircraftTypes = new AircraftTypes((<Array<any>>data['aircraftTypes']).map(x => new AircraftType(x)));
  if (data['aircraftRegisters']) masterData.aircraftRegisters = new AircraftRegisters((<Array<any>>data['aircraftRegisters']).map(x => new AircraftRegister(x)));
  if (data['airports']) masterData.airports = new Airports((<Array<any>>data['airports']).map(x => new Airport(x)));
  if (data['seasonTypes']) masterData.seasonTypes = new SeasonTypes((<Array<any>>data['seasonTypes']).map(x => new SeasonType(x)));
  if (data['seasons']) masterData.seasons = new Seasons((<Array<any>>data['seasons']).map(x => new Season(x)));
  if (data['stcs']) masterData.stcs = new Stcs((<Array<any>>data['stcs']).map(x => new Stc(x)));
  if (data['aircraftGroups']) masterData.aircraftGroups = new AircraftGroups((<Array<any>>data['aircraftGroups']).map(x => new AircraftGroup(x)));
  if (data['constraints']) masterData.constraints = new Constraints((<Array<any>>data['constraints']).map(x => new Constraint(x)));
}

export default masterData;
