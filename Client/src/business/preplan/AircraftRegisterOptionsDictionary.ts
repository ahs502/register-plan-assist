import MasterData, { Airport } from '@core/master-data';
import AircraftRegisterOptionsStatus from '@core/types/AircraftRegisterOptionsStatus';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';

/**
 * A dictionary of aircraft register options by their id values.
 */
export default class AircraftRegisterOptionsDictionary {
  readonly [id: string]: {
    readonly status: AircraftRegisterOptionsStatus;
    readonly baseAirport?: Airport;
  };

  constructor(raw: AircraftRegisterOptionsModel) {
    for (const id in raw.options) {
      (this as any)[id] = {
        status: raw.options[id].status,
        baseAirport: raw.options[id].baseAirportId === undefined ? undefined : MasterData.all.airports.id[raw.options[id].baseAirportId!]
      };
    }
  }

  static defaultAircraftRegisterOptions: AircraftRegisterOptionsDictionary[string] = {
    status: 'IGNORED',
    baseAirport: undefined
  };
}
