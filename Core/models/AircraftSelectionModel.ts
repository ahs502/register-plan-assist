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
    super(validation =>
      validation.object(data).do(({ allowedIdentities, forbiddenIdentities }) => {
        validation.array(allowedIdentities).for((allowedIdentity, index) =>
          validation
            .object(allowedIdentity)
            .in('allowedIdentities', index)
            .set(() => new AircraftIdentityValidation(allowedIdentity, dummyAircraftRegisters))
        );
        validation.array(forbiddenIdentities).for((forbiddenIdentity, index) =>
          validation
            .object(forbiddenIdentity)
            .in('forbiddenIdentities', index)
            .set(() => new AircraftIdentityValidation(forbiddenIdentity, dummyAircraftRegisters))
        );
      })
    );
  }
}
