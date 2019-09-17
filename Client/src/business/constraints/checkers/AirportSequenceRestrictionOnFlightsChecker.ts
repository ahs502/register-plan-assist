import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/Preplan';
import { ConstraintTemplate } from '@core/master-data';
import FlightObjection from '../objections/FlightObjection';
import Flight from 'src/business/flights/Flight';

export default class AirportSequenceRestrictionOnFlightsChecker extends Checker {
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
      lastSuperFlight?: SuperFlight;
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
                  if (result.lastSuperFlight) {
                    !(e.superFlight.nextRound && result.lastSuperFlight.nextRound) &&
                      result.lastSuperFlight.flight.arrivalAirport !== e.superFlight.flight.departureAirport &&
                      result.objections.push(
                        new FlightObjection( //TODO: Refine this instantiation.
                          'ERROR',
                          12345,
                          this,
                          e.superFlight.flight,
                          (constraintMarker, flightMarker) =>
                            `${constraintMarker}: ${flightMarker} departure does not match the arraival of ${result.lastSuperFlight!.flight.label}, ${
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
