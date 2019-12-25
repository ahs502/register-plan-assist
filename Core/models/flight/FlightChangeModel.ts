import Id from '@core/types/Id';
import FlightLegChangeModel, { FlightLegChangeModelValidation } from '@core/models/flight/FlightLegChangeModel';
import Validation from '@ahs502/validation';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';
import Weekday from '@core/types/Weekday';

export default interface FlightChangeModel {
  readonly startDate: string;
  readonly endDate: string;
  readonly aircraftRegisterId?: Id;
  readonly legs: readonly FlightLegChangeModel[];
}

export class FlightChangeModelValidation extends Validation<
  string,
  {
    legs: FlightLegChangeModelValidation[];
  }
> {
  constructor(data: FlightChangeModel, preplanStartDate: Date, preplanEndDate: Date, aircraftRegisterOptions: AircraftRegisterOptionsModel) {
    super(validator =>
      validator.object(data).then(({ startDate, endDate, aircraftRegisterId, legs }) => {
        validator.must(!!startDate, typeof startDate === 'string', !!endDate, typeof endDate === 'string').then(() => {
          const start = new Date(startDate);
          const end = new Date(endDate);
          validator
            .must(start.isValid(), end.isValid())
            .must(
              () => start.getDatePart().equals(start),
              () => end.getDatePart().equals(end)
            )
            .must(
              () => start.toJSON() === startDate,
              () => end.toJSON() === endDate
            )
            .must(() => start <= end)
            .must(
              () => start >= preplanStartDate.getDatePart(),
              () => end <= preplanEndDate.getDatePart()
            );
        });
        validator
          .if(aircraftRegisterId !== undefined)
          .must(() => typeof aircraftRegisterId === 'string')
          .must(() => aircraftRegisterOptions.options.some(option => option.aircraftRegisterId === aircraftRegisterId && option.status !== 'IGNORED'));
        validator.array(legs).each((leg, index) => validator.put(validator.$.legs[index], new FlightLegChangeModelValidation(leg)));
      })
    );
  }
}
