import Validation from '@core/utils/Validation';
import MasterData from '@core/master-data';

export default interface FlightDefinitionModel {
  readonly label: string;
  readonly stcId: string;
  readonly flightNumber: string;
  readonly departureAirportId: string;
  readonly arrivalAirportId: string;
}

export class FlightDefinitionValidation extends Validation<
  | 'LABEL_EXISTS'
  | 'LABEL_IS_VALID'
  | 'STC_EXISTS'
  | 'STC_IS_VALID'
  | 'FLIGHT_NUMBER_EXISTS'
  | 'FLIGHT_NUMBER_IS_VALID'
  | 'DEPARTURE_AIRPORT_EXISTS'
  | 'DEPARTURE_AIRPORT_IS_VALID'
  | 'ARRIVAL_AIRPORT_EXISTS'
  | 'ARRIVAL_AIRPORT_IS_VALID'
> {
  constructor(data: any) {
    super(validator =>
      validator.object(data).do(({ label, stcId, flightNumber, departureAirportId, arrivalAirportId }) => {
        validator.check('LABEL_EXISTS', label).check('LABEL_IS_VALID', () => typeof label === 'string');
        validator.check('STC_EXISTS', stcId).check('STC_IS_VALID', () => typeof stcId === 'string' && !!MasterData.all.stcs.id[stcId]);
        validator
          .check('FLIGHT_NUMBER_EXISTS', flightNumber)
          .check('FLIGHT_NUMBER_IS_VALID', () => typeof flightNumber === 'string' && /^([A-Z]{1}\d{1}\s|\d{1}[A-Z]{1}\s|[A-Z]{2}\s|[A-Z]{3})\d{4}[A-Z]?$/.test(flightNumber));
        validator
          .check('DEPARTURE_AIRPORT_EXISTS', departureAirportId)
          .check('DEPARTURE_AIRPORT_IS_VALID', () => typeof departureAirportId === 'string' && !!MasterData.all.airports.id[departureAirportId]);
        validator
          .check('ARRIVAL_AIRPORT_EXISTS', departureAirportId)
          .check('ARRIVAL_AIRPORT_IS_VALID', () => typeof arrivalAirportId === 'string' && !!MasterData.all.airports.id[arrivalAirportId]);
      })
    );
  }
}
