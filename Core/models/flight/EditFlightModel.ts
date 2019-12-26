import Id from '@core/types/Id';
import FlightLegModel, { FlightLegModelValidation } from '@core/models/flight/FlightLegModel';
import Validation from '@ahs502/validation';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';

export default interface EditFlightModel {
  readonly id?: Id;
  readonly date: string;
  readonly aircraftRegisterId?: Id;
  readonly legs: readonly FlightLegModel[];
}

export class EditFlightModelValidation extends Validation<
  string,
  {
    legs: FlightLegModelValidation[];
  }
> {
  constructor(data: EditFlightModel, flightIds: readonly Id[], aircraftRegisterOptions: AircraftRegisterOptionsModel, preplanStartDate: Date, preplanEndDate: Date) {
    super(validator =>
      validator.object(data).then(({ id, date, aircraftRegisterId, legs }) => {
        validator
          .if(id !== undefined)
          .must(() => typeof id === 'string' && !!id)
          .must(() => flightIds.includes(id));
        validator
          .must(typeof date === 'string', !!date)
          .then(() => new Date(date))
          .must(date => date.isValid() && date.getDatePart().equals(date))
          .must(date => preplanStartDate <= date && date <= preplanEndDate);
        validator
          .if(aircraftRegisterId !== undefined)
          .must(() => typeof aircraftRegisterId === 'string')
          .must(() => aircraftRegisterOptions.options.some(option => option.aircraftRegisterId === aircraftRegisterId && option.status !== 'IGNORED'));
        validator.array(legs).each((leg, index) => validator.put(validator.$.legs[index], new FlightLegModelValidation(leg)));
      })
    );
  }
}

export class EditFlightModelArrayValidation extends Validation<
  string,
  {
    flights: EditFlightModelValidation[];
  }
> {
  constructor(data: readonly EditFlightModel[], flightIds: readonly Id[], aircraftRegisterOptions: AircraftRegisterOptionsModel, preplanStartDate: Date, preplanEndDate: Date) {
    super(validator =>
      validator
        .array(data)
        .each((newFlight, index) =>
          validator.put(validator.$.flights[index], new EditFlightModelValidation(newFlight, flightIds, aircraftRegisterOptions, preplanStartDate, preplanEndDate))
        )
        .must(() => data.map(f => f.date).distinct().length === data.length)
    );
  }
}
