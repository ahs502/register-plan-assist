import Checker from 'src/business/constraints/Checker';
import Objection from 'src/business/constraints/Objection';
import Preplan from 'src/business/Preplan';
import { ConstraintTemplate } from '@core/master-data';
import FlightObjection from '../objections/FlightObjection';
import Flight from 'src/business/flights/Flight';

export default class NoConflictionOnFlightsChecker extends Checker {
  constructor(preplan: Preplan, constraintTemplate: ConstraintTemplate) {
    super(preplan, constraintTemplate);
  }

  check(): FlightObjection[] {
    interface Event {
      start: boolean;
      time: number;
      flight: Flight;
    }

    return Object.keys(this.preplan.flightsByRegister).flatMap(registerId =>
      registerId === '???'
        ? []
        : this.preplan.flightsByRegister[registerId]
            .flatMap<Event>(f => [{ start: true, time: f.weekStd, flight: f }, { start: false, time: f.weekSta, flight: f }])
            .sortBy(e => e.time)
            .reduce<{ flights: Flight[]; objections: FlightObjection[] }>(
              (result, e) => {
                if (e.start) {
                  result.flights.forEach(f =>
                    result.objections.push(
                      new FlightObjection(
                        'ERROR',
                        12345 /*TODO: Define priority */,
                        this,
                        e.flight,
                        (constraintMarker, flightMarker) =>
                          `${constraintMarker} and ${flightMarker} conflicts with ${f.label}, ${f.departureAirport.name}-${f.arrivalAirport.name}.`
                      )
                    )
                  );
                  result.flights.push(e.flight);
                } else {
                  result.flights.remove(e.flight);
                }
                return result;
              },
              { flights: [], objections: [] }
            ).objections
    );
  }
}
