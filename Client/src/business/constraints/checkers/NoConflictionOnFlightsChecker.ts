import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/Preplan';
import { ConstraintTemplate } from '@core/master-data';
import FlightObjection from '../objections/FlightObjection';
import Flight from 'src/business/flights/Flight';

export default class NoConflictionOnFlightsChecker extends Checker {
  constructor(preplan: Preplan, constraintTemplate: ConstraintTemplate) {
    super(preplan, constraintTemplate);
  }

  check(): FlightObjection[] {
    interface SuperFlight {
      flight: Flight;
      nextRound: boolean;
    }
    interface Event {
      starting: boolean;
      time: number;
      superFlight: SuperFlight;
    }
    interface Result {
      superFlights: SuperFlight[];
      objections: FlightObjection[];
    }
    return Object.keys(this.preplan.flightsByRegister).flatMap(registerId =>
      registerId === '???'
        ? []
        : this.preplan.flightsByRegister[registerId]
            .flatMap<Event>(f => {
              const superFlight = { flight: f, nextRound: false };
              const nextRoundSuperFlight = { flight: f, nextRound: true };
              return [
                { starting: true, time: f.weekStd, superFlight },
                { starting: false, time: f.weekSta, superFlight },
                { starting: true, time: f.weekStd + 7 * 24 * 60, superFlight: nextRoundSuperFlight },
                { starting: false, time: f.weekSta + 7 * 24 * 60, superFlight: nextRoundSuperFlight }
              ];
            })
            .sortBy(e => e.time)
            .reduce<Result>(
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
