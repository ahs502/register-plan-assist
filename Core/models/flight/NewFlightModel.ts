import Id from '@core/types/Id';
import FlightLegModel, { FlightLegModelValidation } from '@core/models/flight/FlightLegModel';
import Validation from '@ahs502/validation';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';
import Weekday from '@core/types/Weekday';
import FlightChangeModel, { FlightChangeModelValidation } from '@core/models/flight/FlightChangeModel';

export default interface NewFlightModel {
  readonly day: Weekday;
  readonly aircraftRegisterId?: Id;
  readonly legs: readonly FlightLegModel[];
  readonly changes: readonly FlightChangeModel[];
}

export class NewFlightModelValidation extends Validation<
  string,
  {
    legs: FlightLegModelValidation[];
    changes: FlightChangeModelValidation[];
  }
> {
  constructor(data: NewFlightModel, aircraftRegisterOptions: AircraftRegisterOptionsModel, preplanStartDate: Date, preplanEndDate: Date) {
    super(validator =>
      validator.object(data).then(({ day, aircraftRegisterId, legs, changes }) => {
        validator
          .must(typeof day === 'number', !isNaN(day))
          .must(() => day === Math.round(day))
          .must(() => 0 <= day && day < 7);
        validator
          .if(aircraftRegisterId !== undefined)
          .must(() => typeof aircraftRegisterId === 'string')
          .must(() => aircraftRegisterOptions.options.some(option => option.aircraftRegisterId === aircraftRegisterId && option.status !== 'IGNORED'));
        validator.array(legs).each((leg, index) => validator.put(validator.$.legs[index], new FlightLegModelValidation(leg)));
        validator
          .array(changes)
          .each((change, index) => validator.put(validator.$.changes[index], new FlightChangeModelValidation(change, preplanStartDate, preplanEndDate, aircraftRegisterOptions)))
          .if(validations => validations.every(v => v.ok))
          .then(() => changes.orderBy('startDate'))
          .each((change, index, changes) => validator.must(index === changes.length - 1 ? true : change.endDate <= changes[index + 1].startDate));
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
  constructor(data: readonly NewFlightModel[], aircraftRegisterOptions: AircraftRegisterOptionsModel, preplanStartDate: Date, preplanEndDate: Date) {
    super(validator =>
      validator
        .array(data)
        .each((newFlight, index) => validator.put(validator.$.flights[index], new NewFlightModelValidation(newFlight, aircraftRegisterOptions, preplanStartDate, preplanEndDate)))
        .must(() => data.map(f => f.day).distinct().length === data.length)
    );
  }
}
