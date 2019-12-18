import AircraftSelectionModel, { AircraftSelectionModelValidation } from '@core/models/AircraftSelectionModel';
import Rsx, { Rsxes } from '@core/types/Rsx';
import FlightRequirementLegChangeModel, { FlightRequirementLegChangeModelValidation } from '@core/models/flight-requirement/FlightRequirementLegChangeModel';
import DayFlightRequirementChangeModel, { DayFlightRequirementChangeModelValidation } from '@core/models/flight-requirement/DayFlightRequirementChangeModel';
import Validation from '@ahs502/validation';
import Id from '@core/types/Id';

export default interface FlightRequirementChangeModel {
  readonly startDate: string;
  readonly endDate: string;
  readonly aircraftSelection: AircraftSelectionModel;
  readonly rsx: Rsx;
  readonly notes: string;
  readonly route: readonly FlightRequirementLegChangeModel[];
  readonly days: readonly DayFlightRequirementChangeModel[];
}

export class FlightRequirementChangeModelValidation extends Validation<
  string,
  {
    aircraftSelection: AircraftSelectionModelValidation;
    route: FlightRequirementLegChangeModelValidation[];
    days: DayFlightRequirementChangeModelValidation[];
  }
> {
  constructor(data: FlightRequirementChangeModel, preplanStartDate: Date, preplanEndDate: Date, dummyAircraftRegisterIds: readonly Id[]) {
    super(validator =>
      validator.object(data).then(({ startDate, endDate, aircraftSelection, rsx, notes, route, days }) => {
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
        validator.put(validator.$.aircraftSelection, new AircraftSelectionModelValidation(aircraftSelection, dummyAircraftRegisterIds));
        validator.must(Rsxes.includes(rsx));
        validator.must(typeof notes === 'string').must(() => notes.length <= 1000);
        validator
          .array(route)
          .must(() => route.length > 0)
          .each((leg, index) => validator.put(validator.$.route[index], new FlightRequirementLegChangeModelValidation(leg)));
        validator
          .array(days)
          .must(() => days.length > 0)
          .each((day, index) => validator.put(validator.$.days[index], new DayFlightRequirementChangeModelValidation(day, dummyAircraftRegisterIds)));
      })
    );
  }
}
