import AircraftType, { AircraftTypes } from './AircraftType';
import AircraftRegister, { AircraftRegisters } from './AircraftRegister';
import Airport, { Airports } from './Airport';
import SeasonType, { SeasonTypes } from './SeasonType';
import Season, { Seasons } from './Season';
import Stc, { Stcs } from './Stc';

var masterData = {
  aircraftTypes: new AircraftTypes([]),
  aircraftRegisters: new AircraftRegisters([]),
  airports: new Airports([]),
  seasonTypes: new SeasonTypes([]),
  seasons: new Seasons([]),
  stcs: new Stcs([])
};

export function parse(data: any) {
  masterData.aircraftTypes = new AircraftTypes((<Array<any>>data['aircraftTypes']).map(x => new AircraftType(x)));
  masterData.aircraftRegisters = new AircraftRegisters((<Array<any>>data['aircraftRegisters']).map(x => new AircraftRegister(x)));
  masterData.airports = new Airports((<Array<any>>data['airports']).map(x => new Airport(x)));
  masterData.seasonTypes = new SeasonTypes((<Array<any>>data['seasonTypes']).map(x => new SeasonType(x)));
  masterData.seasons = new Seasons((<Array<any>>data['seasons']).map(x => new Season(x)));
  masterData.stcs = new Stcs((<Array<any>>data['stcs']).map(x => new Stc(x)));
}

export default masterData;
