import Id from '@core/types/Id';
import FlightLegModel, { FlightLegModelValidation } from '@core/models/flight/FlightLegModel';
import Validation from '@ahs502/validation';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';

export default interface NewFlightModel {
  readonly day: number;
  readonly aircraftRegisterId?: Id;
  readonly legs: readonly FlightLegModel[];
}

export class NewFlightModelValidation extends Validation<
  string,
  {
    legs: FlightLegModelValidation[];
  }
> {
  constructor(data: NewFlightModel, aircraftRegisterOptions: AircraftRegisterOptionsModel) {
    super(validator =>
      validator.object(data).then(({ day, aircraftRegisterId, legs }) => {
        validator
          .must(typeof day === 'number', !isNaN(day))
          .must(() => day === Math.round(day))
          .must(() => 0 <= day && day < 7);
        validator
          .if(aircraftRegisterId !== undefined)
          .must(() => typeof aircraftRegisterId === 'string')
          .must(() => aircraftRegisterOptions.options.some(option => option.aircraftRegisterId === aircraftRegisterId && option.status !== 'IGNORED'));
        validator.array(legs).each((leg, index) => validator.put(validator.$.legs[index], new FlightLegModelValidation(leg)));
      })
    );
  }
}

export class NewFlightModelArrayValidation extends Validation<
  string,
  {
    flights: NewFlightModelValidation[];
  }
> {
  constructor(data: readonly NewFlightModel[], aircraftRegisterOptions: AircraftRegisterOptionsModel) {
    super(validator =>
      validator
        .array(data)
        .each((newFlight, index) => validator.put(validator.$.flights[index], new NewFlightModelValidation(newFlight, aircraftRegisterOptions)))
        .must(() => data.map(f => f.day).distinct().length === data.length)
    );
  }
}
