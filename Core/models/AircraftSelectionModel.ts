import AircraftIdentityModel, { AircraftIdentityValidation } from './AircraftIdentityModel';
import DummyAircraftRegisterModel from './DummyAircraftRegisterModel';
import Validation from '@ahs502/validation';

export default interface AircraftSelectionModel {
  readonly allowedIdentities: readonly AircraftIdentityModel[];
  readonly forbiddenIdentities: readonly AircraftIdentityModel[];
}

export class AircraftSelectionValidation extends Validation<
  never,
  {
    readonly allowedIdentities: readonly AircraftIdentityValidation[];
    readonly forbiddenIdentities: readonly AircraftIdentityValidation[];
  }
> {
  constructor(data: any, dummyAircraftRegisters: readonly DummyAircraftRegisterModel[]) {
    super(validator =>
      validator.object(data).do(({ allowedIdentities, forbiddenIdentities }) => {
        validator.array(allowedIdentities).for((allowedIdentity, index) =>
          validator
            .object(allowedIdentity)
            .in('allowedIdentities', index)
            .set(() => new AircraftIdentityValidation(allowedIdentity, dummyAircraftRegisters))
        );
        validator.array(forbiddenIdentities).for((forbiddenIdentity, index) =>
          validator
            .object(forbiddenIdentity)
            .in('forbiddenIdentities', index)
            .set(() => new AircraftIdentityValidation(forbiddenIdentity, dummyAircraftRegisters))
        );
      })
    );
  }
}
