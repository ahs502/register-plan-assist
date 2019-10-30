import AircraftIdentityModel, { AircraftIdentityModelValidation } from './AircraftIdentityModel';
import Validation from '@ahs502/validation';
import Id from '@core/types/Id';

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
  constructor(data: AircraftSelectionModel, dummyAircraftRegisterIds: readonly Id[]) {
    super(validator =>
      validator.object(data).then(({ includedIdentities, excludedIdentities }) => {
        validator
          .array(includedIdentities)
          .each((identity, index) => validator.put(validator.$.includedIdentities[index], new AircraftIdentityModelValidation(identity, dummyAircraftRegisterIds)));
        validator
          .array(excludedIdentities)
          .each((identity, index) => validator.put(validator.$.excludedIdentities[index], new AircraftIdentityModelValidation(identity, dummyAircraftRegisterIds)));
      })
    );
  }
}
