import AircraftIdentityModel, { AircraftIdentityModelValidation } from './AircraftIdentityModel';
import Validation from '@ahs502/validation';
import Id from '@core/types/Id';
import MasterDataCollection from '@core/types/MasterDataCollection';
import AircraftTypeModel from '@core/models/master-data/AircraftTypeModel';
import AircraftRegisterModel from '@core/models/master-data/AircraftRegisterModel';
import AircraftRegisterGroupModel from '@core/models/master-data/AircraftRegisterGroupModel';

export default interface AircraftSelectionModel {
  readonly includedIdentities: readonly AircraftIdentityModel[];
  readonly excludedIdentities: readonly AircraftIdentityModel[];
}

export class AircraftSelectionModelValidation extends Validation<
  string,
  {
    includedIdentities: AircraftIdentityModelValidation[];
    excludedIdentities: AircraftIdentityModelValidation[];
  }
> {
  constructor(
    data: AircraftSelectionModel,
    aircraftTypes: MasterDataCollection<AircraftTypeModel>,
    aircraftRegisters: MasterDataCollection<AircraftRegisterModel>,
    aircraftRegisterGroups: MasterDataCollection<AircraftRegisterGroupModel>,
    dummyAircraftRegisterIds: readonly Id[]
  ) {
    super(validator =>
      validator.object(data).then(({ includedIdentities, excludedIdentities }) => {
        validator
          .array(includedIdentities)
          .each((identity, index) =>
            validator.put(
              validator.$.includedIdentities[index],
              new AircraftIdentityModelValidation(identity, aircraftTypes, aircraftRegisters, aircraftRegisterGroups, dummyAircraftRegisterIds)
            )
          );
        validator
          .array(excludedIdentities)
          .each((identity, index) =>
            validator.put(
              validator.$.excludedIdentities[index],
              new AircraftIdentityModelValidation(identity, aircraftTypes, aircraftRegisters, aircraftRegisterGroups, dummyAircraftRegisterIds)
            )
          );
      })
    );
  }
}
