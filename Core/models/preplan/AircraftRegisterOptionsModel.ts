import AircraftRegisterOptionsStatus, { AircraftRegisterOptionsStatuses } from '@core/types/AircraftRegisterOptionsStatus';
import Id from '@core/types/Id';
import Validation from '@ahs502/validation';
import MasterData from '@core/master-data';

export default interface AircraftRegisterOptionsModel {
  readonly options: readonly {
    readonly aircraftRegisterId: Id;
    readonly status: AircraftRegisterOptionsStatus;
    readonly baseAirportId?: Id;
  }[];
}

export class AircraftRegisterOptionsModelValidation extends Validation {
  constructor(data: AircraftRegisterOptionsModel, dummyAircraftRegisterIds: readonly Id[]) {
    super(validator =>
      validator.object(data).then(({ options }) => {
        validator
          .array(options)
          .must(options => options.map(o => o.aircraftRegisterId).distinct().length === options.length)
          .each(({ aircraftRegisterId, status, baseAirportId }) => {
            validator
              .must(typeof aircraftRegisterId === 'string', !!aircraftRegisterId)
              .must(() => aircraftRegisterId in MasterData.all.aircraftRegisters.id || dummyAircraftRegisterIds.includes(aircraftRegisterId));
            validator
              .must(AircraftRegisterOptionsStatuses.includes(status))
              .if(() => status !== 'IGNORED')
              .must(() => baseAirportId !== undefined);
            validator
              .if(baseAirportId !== undefined)
              .must(() => typeof baseAirportId === 'string')
              .must(() => baseAirportId! in MasterData.all.airports.id);
          });
      })
    );
  }
}
