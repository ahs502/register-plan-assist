import NewFlightRequirementModel, { NewFlightRequirementModelValidation } from './NewFlightRequirementModel';
import Id from '@core/types/Id';
import Validation from '@ahs502/validation';
import MasterDataCollection from '@core/types/MasterDataCollection';
import StcModel from '@core/models/master-data/StcModel';
import AirportModel from '@core/models/master-data/AirportModel';
import AircraftTypeModel from '@core/models/master-data/AircraftTypeModel';
import AircraftRegisterModel from '@core/models/master-data/AircraftRegisterModel';
import AircraftRegisterGroupModel from '@core/models/master-data/AircraftRegisterGroupModel';

export default interface FlightRequirementModel extends NewFlightRequirementModel {
  readonly id: Id;
}

export class FlightRequirementModelValidation extends Validation<
  string,
  {
    newFlightRequirement: NewFlightRequirementModelValidation;
  }
> {
  constructor(
    data: FlightRequirementModel,
    aircraftTypes: MasterDataCollection<AircraftTypeModel>,
    aircraftRegisters: MasterDataCollection<AircraftRegisterModel>,
    aircraftRegisterGroups: MasterDataCollection<AircraftRegisterGroupModel>,
    airports: MasterDataCollection<AirportModel>,
    stcs: MasterDataCollection<StcModel>,
    flightRequirementIds: readonly Id[],
    otherExistingLabels: readonly string[],
    dummyAircraftRegisterIds: readonly Id[],
    preplanStartDate: Date,
    preplanEndDate: Date
  ) {
    super(validator =>
      validator
        .put(
          validator.$.newFlightRequirement,
          new NewFlightRequirementModelValidation(
            data,
            aircraftTypes,
            aircraftRegisters,
            aircraftRegisterGroups,
            airports,
            stcs,
            otherExistingLabels,
            dummyAircraftRegisterIds,
            preplanStartDate,
            preplanEndDate
          )
        )
        .object(data)
        .then(({ id }) => validator.must(() => flightRequirementIds.includes(id)))
    );
  }
}
