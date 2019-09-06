import Objection, { ObjectionType } from './Objection';
import Constraint from 'src/business/constraints/Constraint';
import Flight from 'src/business/flights/Flight';
import Weekday from '@core/types/Weekday';

export default class FlightObjection extends Objection {
  readonly flight: Flight;

  constructor(type: ObjectionType, priority: number, constraint: Constraint, flight: Flight, messageProvider: (constraintMarker: string, flightMarker: string) => string) {
    super(type, priority + 400, constraint, constraintMarker =>
      messageProvider(constraintMarker, `flight ${flight.label} from ${flight.departureAirport.name} to ${flight.arrivalAirport.name} on ${Weekday[flight.day]}s`)
    );
    this.flight = flight;
  }
}
