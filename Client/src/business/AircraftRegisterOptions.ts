import AircraftRegisterStatus from '@core/types/aircraft-register-options/AircraftRegisterStatus';
import AircraftRegisterOptionsModel, { AircraftRegisterOptionsDictionaryModel } from '@core/models/AircraftRegisterOptionsModel';
import MasterData, { Airport } from '@core/master-data';

/**
 * The selected options for an aircraft register in a preplan.
 */
export default class AircraftRegisterOptions {
  readonly status: AircraftRegisterStatus;
  readonly startingAirport?: Airport;

  constructor(raw: AircraftRegisterOptionsModel) {
    this.status = raw.status;
    this.startingAirport = raw.startingAirportId ? MasterData.all.airports.id[raw.startingAirportId] : undefined;
  }

  static default = new AircraftRegisterOptions({
    status: 'IGNORED',
    startingAirportId: undefined
  });
}

/**
 * A dictionary of aircraft register options by their id values.
 */
export class AircraftRegisterOptionsDictionary {
  readonly [id: string]: AircraftRegisterOptions;

  constructor(raw: AircraftRegisterOptionsDictionaryModel) {
    for (const id in raw) {
      (this as any)[id] = new AircraftRegisterOptions(raw[id]);
    }
  }
}
