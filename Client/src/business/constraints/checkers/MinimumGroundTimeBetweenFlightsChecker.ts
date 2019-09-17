import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { ConstraintTemplate } from '@core/master-data';
import FlightObjection from 'src/business/constraints/objections/FlightObjection';
import { SuperFlight } from 'src/business/constraints/ConstraintSystem';

export default class MinimumGroundTimeBetweenFlightsChecker extends Checker {
  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraintTemplate: ConstraintTemplate) {
    super(preplan, constraintSystem, constraintTemplate);
  }

  check(): FlightObjection[] {
    return Object.keys(this.constraintSystem.flightEventsByRegister).flatMap(
      registerId =>
        this.constraintSystem.flightEventsByRegister[registerId].reduce<{
          superFlights: SuperFlight[];
          lastSuperFlight?: SuperFlight;
          lastTime: number;
          objections: FlightObjection[];
        }>(
          (result, e) => {
            if (e.starting) {
              if (result.lastSuperFlight) {
                !(e.superFlight.nextRound && result.lastSuperFlight.nextRound) &&
                  e.time - e.superFlight.flight.getRequiredMinimumGroundTime(this.preplan.startDate, this.preplan.endDate, 'MAXIMUM') < result.lastTime &&
                  result.objections.push(
                    new FlightObjection( //TODO: Refine this instantiation.
                      'ERROR',
                      12345,
                      this,
                      e.superFlight.flight,
                      (constraintMarker, flightMarker) => `${constraintMarker}: ${flightMarker} does not meet enough ground time before take off.`
                    )
                  );
                delete result.lastSuperFlight;
              }
              result.superFlights.push(e.superFlight);
            } else {
              result.superFlights.remove(e.superFlight);
              if (result.superFlights.length === 0) {
                result.lastSuperFlight = e.superFlight;
                result.lastTime = e.time;
              }
            }
            return result;
          },
          { superFlights: [], lastTime: 0, objections: [] }
        ).objections
    );
  }
}
