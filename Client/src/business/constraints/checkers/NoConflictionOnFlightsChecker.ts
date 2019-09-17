import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { ConstraintTemplate } from '@core/master-data';
import FlightObjection from 'src/business/constraints/objections/FlightObjection';
import { SuperFlight } from 'src/business/constraints/ConstraintSystem';

export default class NoConflictionOnFlightsChecker extends Checker {
  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraintTemplate: ConstraintTemplate) {
    super(preplan, constraintSystem, constraintTemplate);
  }

  check(): FlightObjection[] {
    return Object.keys(this.constraintSystem.flightEventsByRegister).flatMap(
      registerId =>
        this.constraintSystem.flightEventsByRegister[registerId].reduce<{ superFlights: SuperFlight[]; objections: FlightObjection[] }>(
          (result, e) => {
            if (e.starting) {
              result.superFlights.forEach(
                s =>
                  !(e.superFlight.nextRound && s.nextRound) &&
                  result.objections.push(
                    new FlightObjection( //TODO: Refine this instantiation.
                      'ERROR',
                      12345,
                      this,
                      e.superFlight.flight,
                      (constraintMarker, flightMarker) =>
                        `${constraintMarker} and ${flightMarker} conflicts with ${s.flight.label}, ${s.flight.departureAirport.name}-${s.flight.arrivalAirport.name}.`
                    )
                  )
              );
              result.superFlights.push(e.superFlight);
            } else {
              result.superFlights.remove(e.superFlight);
            }
            return result;
          },
          { superFlights: [], objections: [] }
        ).objections
    );
  }
}
