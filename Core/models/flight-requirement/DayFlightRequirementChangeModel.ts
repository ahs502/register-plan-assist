import AircraftSelectionModel, { AircraftSelectionModelValidation } from '@core/models/AircraftSelectionModel';
import Rsx, { Rsxes } from '@core/types/Rsx';
import Weekday from '@core/types/Weekday';
import DayFlightRequirementLegChangeModel, { DayFlightRequirementLegChangeModelValidation } from '@core/models/flight-requirement/DayFlightRequirementLegChangeModel';
import Validation from '@ahs502/validation';
import Id from '@core/types/Id';

export default interface DayFlightRequirementChangeModel {
  readonly aircraftSelection: AircraftSelectionModel;
  readonly rsx: Rsx;
  readonly day: Weekday;
  readonly notes: string;
  readonly route: readonly DayFlightRequirementLegChangeModel[];
}

export class DayFlightRequirementChangeModelValidation extends Validation<
  string,
  {
    aircraftSelection: AircraftSelectionModelValidation;
    route: DayFlightRequirementLegChangeModelValidation[];
  }
> {
  constructor(data: DayFlightRequirementChangeModel, dummyAircraftRegisterIds: readonly Id[]) {
    super(validator =>
      validator.object(data).then(({ aircraftSelection, rsx, day, notes, route }) => {
        validator.put(validator.$.aircraftSelection, new AircraftSelectionModelValidation(aircraftSelection, dummyAircraftRegisterIds));
        validator.must(Rsxes.includes(rsx));
        validator.must(typeof day === 'number', !isNaN(day)).must(() => day === Math.round(day) && day >= 0 && day < 7);
        validator.must(typeof notes === 'string');
        validator.array(route).each((leg, index) => validator.put(validator.$.route[index], new DayFlightRequirementLegChangeModelValidation(leg)));
      })
    );
  }
}
