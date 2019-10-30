import Id from '@core/types/Id';
import Validation from '@ahs502/validation';
import FlightNumber from '@core/types/FlightNumber';
import MasterData from '@core/master-data';

export default interface FlightRequirementLegModel {
  readonly flightNumber: string;
  readonly departureAirportId: Id;
  readonly arrivalAirportId: Id;
  readonly blockTime: number;
  readonly stdLowerBound: number;
  readonly stdUpperBound?: number;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;
}

export class FlightRequirementLegModelValidation extends Validation {
  constructor(data: FlightRequirementLegModel) {
    super(validator =>
      validator.object(data).then(({ flightNumber, departureAirportId, arrivalAirportId, blockTime, stdLowerBound, stdUpperBound, originPermission, destinationPermission }) => {
        validator.must(typeof flightNumber === 'string', !!flightNumber).must(() => new FlightNumber(flightNumber).isValid);
        validator.must(typeof departureAirportId === 'string').must(() => departureAirportId in MasterData.all.airports.id);
        validator.must(typeof arrivalAirportId === 'string').must(() => arrivalAirportId in MasterData.all.airports.id);
        validator.must(typeof blockTime === 'number', !isNaN(blockTime)).must(() => blockTime > 0 && blockTime <= 16 * 60);
        validator.must(typeof stdLowerBound === 'number', !isNaN(stdLowerBound)).then(() => stdLowerBound >= 0);
        validator
          .if(stdUpperBound !== undefined)
          .must(() => typeof stdUpperBound === 'number', () => !isNaN(stdUpperBound!))
          .must(() => stdUpperBound! > 0);
        validator.must(typeof originPermission === 'boolean', typeof destinationPermission === 'boolean');
      })
    );
  }
}
