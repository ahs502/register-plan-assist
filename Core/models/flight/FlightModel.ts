import Id from '@core/types/Id';
import Validation from '@ahs502/validation';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';
import EditFlightModel, { EditFlightModelValidation } from '@core/models/flight/EditFlightModel';

export default interface FlightModel extends EditFlightModel {
  readonly id: Id;
  readonly flightRequirementId: Id;
}

export class FlightModelValidation extends Validation<
  string,
  {
    newFlight: EditFlightModelValidation;
  }
> {
  constructor(
    data: FlightModel,
    flightIds: readonly Id[],
    flightRequirementIds: readonly Id[],
    aircraftRegisterOptions: AircraftRegisterOptionsModel,
    preplanStartDate: Date,
    preplanEndDate: Date
  ) {
    super(validator =>
      validator
        .put(validator.$.newFlight, new EditFlightModelValidation(data, flightIds, aircraftRegisterOptions, preplanStartDate, preplanEndDate))
        .object(data)
        .then(({ flightRequirementId }) => {
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
  constructor(
    data: readonly FlightModel[],
    flightIds: readonly Id[],
    flightRequirementIds: readonly Id[],
    aircraftRegisterOptions: AircraftRegisterOptionsModel,
    preplanStartDate: Date,
    preplanEndDate: Date
  ) {
    super(validator =>
      validator
        .array(data)
        .each((flight, index) =>
          validator.put(validator.$.flights[index], new FlightModelValidation(flight, flightIds, flightRequirementIds, aircraftRegisterOptions, preplanStartDate, preplanEndDate))
        )
        .must(() => data.map(f => f.date).distinct().length === data.length)
        .must(() => data.map(f => f.flightRequirementId).distinct().length <= 1)
    );
  }
}
