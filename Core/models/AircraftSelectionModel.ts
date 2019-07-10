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
  constructor(aircraftSelection: AircraftSelectionModel, dummyAircraftRegisters: readonly DummyAircraftRegisterModel[]) {
    super(validator =>
      validator.object(aircraftSelection).do(({ allowedIdentities, forbiddenIdentities }) => {
        validator
          .array(allowedIdentities)
          .each((allowedIdentity, index) => validator.into('allowedIdentities', index).set(() => new AircraftIdentityValidation(allowedIdentity, dummyAircraftRegisters)));
        validator
          .array(forbiddenIdentities)
          .each((forbiddenIdentity, index) => validator.into('forbiddenIdentities', index).set(() => new AircraftIdentityValidation(forbiddenIdentity, dummyAircraftRegisters)));
      })
    );
  }
}
