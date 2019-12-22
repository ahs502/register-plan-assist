import { Airport } from 'src/business/master-data';
import AircraftRegisterOptionsStatus from '@core/types/AircraftRegisterOptionsStatus';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';
import { dataTypes } from 'src/utils/DataType';

/**
 * A dictionary of aircraft register options by their id values.
 */
export default class AircraftRegisterOptionsDictionary {
  readonly [id: string]: {
    readonly status: AircraftRegisterOptionsStatus;
    readonly baseAirport?: Airport;
  };

  constructor(raw: AircraftRegisterOptionsModel) {
    for (const option of raw.options) {
      ((this as unknown) as { [id: string]: AircraftRegisterOptionsDictionary[string] })[option.aircraftRegisterId] = {
        status: option.status,
        baseAirport: dataTypes.airport.convertModelToBusinessOptional(option.baseAirportId)
      };
    }
  }

  static defaultAircraftRegisterOptions: AircraftRegisterOptionsDictionary[string] = {
    status: 'IGNORED',
    baseAirport: undefined
  };
}
