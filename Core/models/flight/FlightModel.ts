import Id from '@core/types/Id';
import Validation from '@ahs502/validation';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';
import NewFlightModel, { NewFlightModelValidation } from '@core/models/flight/NewFlightModel';

export default interface FlightModel extends NewFlightModel {
  readonly id: Id;
  readonly flightRequirementId: Id;
}

export class FlightModelValidation extends Validation<
  string,
  {
    newFlight: NewFlightModelValidation;
  }
> {
  constructor(data: FlightModel, flightIds: readonly Id[], flightRequirementIds: readonly Id[], aircraftRegisterOptions: AircraftRegisterOptionsModel) {
    super(validator =>
      validator
        .put(validator.$.newFlight, new NewFlightModelValidation(data, aircraftRegisterOptions))
        .object(data)
        .then(({ id, flightRequirementId }) => {
          validator.must(typeof id === 'string', !!id).must(() => flightIds.includes(id));
          validator.must(typeof flightRequirementId === 'string', !!flightRequirementId).must(() => flightRequirementIds.includes(flightRequirementId));
        })
    );
  }
}

export class FlightModelArrayValidation extends Validation<
  string,
  {
    flights: FlightModelValidation[];
  }
> {
  constructor(data: readonly FlightModel[], flightIds: readonly Id[], flightRequirementIds: readonly Id[], aircraftRegisterOptions: AircraftRegisterOptionsModel) {
    super(validator =>
      validator
        .array(data)
        .each((flight, index) => validator.put(validator.$.flights[index], new FlightModelValidation(flight, flightIds, flightRequirementIds, aircraftRegisterOptions)))
        .must(() => data.map(f => f.day).distinct().length === data.length)
        .must(() => data.map(f => f.flightRequirementId).distinct().length === 1)
    );
  }
}
