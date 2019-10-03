import NewFlightRequirementModel, { NewFlightRequirementModelValidation } from './NewFlightRequirementModel';
import Id from '@core/types/Id';
import Validation from '@ahs502/validation';

export default interface FlightRequirementModel extends NewFlightRequirementModel {
  readonly id: Id;
}

export class FlightRequirementModelValidation extends Validation<
  string,
  {
    newFlightRequirement: NewFlightRequirementModelValidation;
  }
> {
  constructor(data: FlightRequirementModel, flightRequirementIds: readonly Id[], dummyAircraftRegisterIds: readonly Id[]) {
    super(validator =>
      validator
        .put(validator.$.newFlightRequirement, new NewFlightRequirementModelValidation(data, dummyAircraftRegisterIds))
        .object(data)
        .then(({ id }) => validator.must(() => flightRequirementIds.includes(id)))
    );
  }
}
