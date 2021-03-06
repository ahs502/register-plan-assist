import AircraftSelectionModel, { AircraftSelectionModelValidation } from '@core/models/AircraftSelectionModel';
import Rsx, { Rsxes } from '@core/types/Rsx';
import DayFlightRequirementLegModel, { DayFlightRequirementLegModelValidation } from './DayFlightRequirementLegModel';
import Id from '@core/types/Id';
import Validation from '@ahs502/validation';
import Weekday from '@core/types/Weekday';
import MasterDataCollection from '@core/types/MasterDataCollection';
import AircraftTypeModel from '@core/models/master-data/AircraftTypeModel';
import AircraftRegisterModel from '@core/models/master-data/AircraftRegisterModel';
import AircraftRegisterGroupModel from '@core/models/master-data/AircraftRegisterGroupModel';

export default interface DayFlightRequirementModel {
  readonly aircraftSelection: AircraftSelectionModel;
  readonly rsx: Rsx;
  readonly day: Weekday;
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
  constructor(
    data: DayFlightRequirementModel,
    aircraftTypes: MasterDataCollection<AircraftTypeModel>,
    aircraftRegisters: MasterDataCollection<AircraftRegisterModel>,
    aircraftRegisterGroups: MasterDataCollection<AircraftRegisterGroupModel>,
    dummyAircraftRegisterIds: readonly Id[]
  ) {
    super(validator =>
      validator.object(data).then(({ aircraftSelection, rsx, day, notes, route }) => {
        validator.put(
          validator.$.aircraftSelection,
          new AircraftSelectionModelValidation(aircraftSelection, aircraftTypes, aircraftRegisters, aircraftRegisterGroups, dummyAircraftRegisterIds)
        );
        validator.must(Rsxes.includes(rsx));
        validator.must(typeof day === 'number', !isNaN(day)).must(() => day === Math.round(day) && day >= 0 && day < 7);
        validator.must(typeof notes === 'string');
        validator.array(route).each((leg, index) => validator.put(validator.$.route[index], new DayFlightRequirementLegModelValidation(leg)));
      })
    );
  }
}
