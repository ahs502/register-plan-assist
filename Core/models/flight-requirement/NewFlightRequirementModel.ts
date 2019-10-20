import AircraftSelectionModel, { AircraftSelectionModelValidation } from '../AircraftSelectionModel';
import Rsx, { Rsxes } from '@core/types/Rsx';
import FlightRequirementLegModel, { FlightRequirementLegModelValidation } from './FlightRequirementLegModel';
import DayFlightRequirementModel, { DayFlightRequirementModelValidation } from './DayFlightRequirementModel';
import Id from '@core/types/Id';
import Validation from '@ahs502/validation';
import MasterData from '@core/master-data';

export default interface NewFlightRequirementModel {
  readonly label: string;
  readonly category: string;
  readonly stcId: Id;
  readonly aircraftSelection: AircraftSelectionModel;
  readonly rsx: Rsx;
  readonly ignored: boolean;
  readonly route: readonly FlightRequirementLegModel[];
  readonly days: readonly DayFlightRequirementModel[];
}

export class NewFlightRequirementModelValidation extends Validation<
  string,
  {
    aircraftSelection: AircraftSelectionModelValidation;
    route: FlightRequirementLegModelValidation[];
    days: DayFlightRequirementModelValidation[];
  }
> {
  constructor(data: NewFlightRequirementModel, dummyAircraftRegisterIds: readonly Id[]) {
    super(validator =>
      validator.object(data).then(({ label, category, stcId, aircraftSelection, rsx, ignored, route, days }) => {
        validator.must(typeof label === 'string', !!label).must(() => label === label.trim().toUpperCase());
        validator.must(typeof category === 'string').must(() => category === category.trim().toUpperCase());
        validator.must(typeof stcId === 'string').must(() => stcId in MasterData.all.stcs.id);
        validator.put(validator.$.aircraftSelection, new AircraftSelectionModelValidation(aircraftSelection, dummyAircraftRegisterIds));
        validator.must(Rsxes.includes(rsx));
        validator.must(typeof ignored === 'boolean');
        validator
          .array(route)
          .must(() => route.length > 0)
          .each((leg, index) => validator.put(validator.$.route[index], new FlightRequirementLegModelValidation(leg)));
        validator
          .array(days)
          .must(() => days.length > 0)
          .each((day, index) => validator.put(validator.$.days[index], new DayFlightRequirementModelValidation(day, dummyAircraftRegisterIds)));
      })
    );
  }
}
