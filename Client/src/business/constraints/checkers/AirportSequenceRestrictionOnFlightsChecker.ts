import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { ConstraintTemplate } from '@core/master-data';
import Objection from 'src/business/constraints/Objection';
import { SuperFlight } from 'src/business/constraints/ConstraintSystem';

export default class AirportSequenceRestrictionOnFlightsChecker extends Checker {
  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraintTemplate: ConstraintTemplate) {
    super(preplan, constraintSystem, constraintTemplate);
  }

  check(): Objection[] {
    return Object.keys(this.constraintSystem.flightEventsByRegister).flatMap(
      registerId =>
        this.constraintSystem.flightEventsByRegister[registerId].reduce<{ superFlights: SuperFlight[]; lastSuperFlight?: SuperFlight; objections: Objection[] }>(
          (result, e) => {
            if (e.starting) {
              if (result.lastSuperFlight) {
                !(e.superFlight.nextRound && result.lastSuperFlight.nextRound) &&
                  result.lastSuperFlight.flight.arrivalAirport !== e.superFlight.flight.departureAirport &&
                  result.objections.push(
                    e.superFlight.flight.issueObjection(
                      'ERROR',
                      12345,
                      this,
                      constraintMarker =>
                        `${constraintMarker}: ${e.superFlight.flight.marker} departure does not match the arraival of ${result.lastSuperFlight!.flight.label}, ${
                          result.lastSuperFlight!.flight.departureAirport.name
                        }-${result.lastSuperFlight!.flight.arrivalAirport.name}.`
                    )
                  );
                delete result.lastSuperFlight;
              }
              result.superFlights.push(e.superFlight);
            } else {
              result.superFlights.remove(e.superFlight);
              result.superFlights.length > 0 || (result.lastSuperFlight = e.superFlight);
            }
            return result;
          },
          { superFlights: [], objections: [] }
        ).objections
    );
  }
}
