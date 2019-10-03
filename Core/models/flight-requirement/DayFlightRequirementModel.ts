import AircraftSelectionModel, { AircraftSelectionModelValidation } from '@core/models/AircraftSelectionModel';
import Rsx, { Rsxes } from '@core/types/Rsx';
import DayFlightRequirementLegModel, { DayFlightRequirementLegModelValidation } from './DayFlightRequirementLegModel';
import Id from '@core/types/Id';
import Validation from '@ahs502/validation';
import MasterData from '@core/master-data';

export default interface DayFlightRequirementModel {
  readonly aircraftSelection: AircraftSelectionModel;
  readonly rsx: Rsx;
  readonly required: boolean;
  readonly freezed: boolean;
  readonly day: number;
  readonly aircraftRegisterId?: Id;
  readonly notes: string;
  readonly route: readonly DayFlightRequirementLegModel[];
}

export class DayFlightRequirementModelValidation extends Validation<
  string,
  {
    aircraftSelection: AircraftSelectionModelValidation;
    route: DayFlightRequirementLegModelValidation[];
  }
> {
  constructor(data: DayFlightRequirementModel, dummyAircraftRegisterIds: readonly Id[]) {
    super(validator =>
      validator.object(data).then(({ aircraftSelection, rsx, required, freezed, day, aircraftRegisterId, notes, route }) => {
        validator.put(validator.$.aircraftSelection, new AircraftSelectionModelValidation(aircraftSelection, dummyAircraftRegisterIds));
        validator.must(Rsxes.includes(rsx));
        validator.must(typeof required === 'boolean');
        validator.must(typeof freezed === 'boolean');
        validator.must(typeof day === 'number', !isNaN(day)).must(() => day === Math.round(day) && day >= 0 && day < 7);
        validator
          .if(aircraftRegisterId !== undefined)
          .must(() => typeof aircraftRegisterId === 'string')
          .must(() => aircraftRegisterId in MasterData.all.aircraftRegisters.id || dummyAircraftRegisterIds.includes(aircraftRegisterId));
        validator.must(typeof notes === 'string');
        validator.array(route).each((leg, index) => validator.put(validator.$.route[index], new DayFlightRequirementLegModelValidation(leg)));
      })
    );
  }
}
