import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import Checker from 'src/business/constraints/Checker';
import Flight from 'src/business/flights/Flight';
import Weekday from '@core/types/Weekday';

export default class FlightObjection extends Objection {
  constructor(type: ObjectionType, priority: number, checker: Checker, readonly flight: Flight, messageProvider: (constraintMarker: string, flightMarker: string) => string) {
    super(type, 'FLIGHT', priority, checker, constraintMarker =>
      messageProvider(
        constraintMarker,
        `flight ${flight.label} number ${flight.flightNumber} from ${flight.departureAirport.name} to ${flight.arrivalAirport.name} on ${Weekday[flight.day]}s`
      )
    );
  }

  get targetId(): string {
    return this.flight.derivedId;
  }
}
