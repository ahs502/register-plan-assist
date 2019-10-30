import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/preplan/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { ConstraintTemplate } from '@core/master-data';

export default class AirportSequenceRestrictionOnFlightsChecker extends Checker {
  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraintTemplate: ConstraintTemplate) {
    super(preplan, constraintSystem, constraintTemplate);
  }

  check(): void {
    // return Object.keys(this.constraintSystem.flightEventsByRegister).flatMap(
    //   registerId =>
    //     this.constraintSystem.flightEventsByRegister[registerId].reduce<{ superFlights: SuperFlightLeg[]; lastSuperFlight?: SuperFlightLeg; objections: Objection[] }>(
    //       (result, e) => {
    //         if (e.starting) {
    //           if (result.lastSuperFlight) {
    //             !(e.superFlightLeg.nextRound && result.lastSuperFlight.nextRound) &&
    //               result.lastSuperFlight.flightLeg.arrivalAirport !== e.superFlightLeg.flightLeg.departureAirport &&
    //               result.objections.push(
    //                 e.superFlightLeg.flightLeg.issueObjection(
    //                   'ERROR',
    //                   12345,
    //                   this,
    //                   constraintMarker =>
    //                     `${constraintMarker}: ${e.superFlightLeg.flightLeg.marker} departure does not match the arraival of ${result.lastSuperFlight!.flightLeg.label}, ${
    //                       result.lastSuperFlight!.flightLeg.departureAirport.name
    //                     }-${result.lastSuperFlight!.flightLeg.arrivalAirport.name}.`
    //                 )
    //               );
    //             delete result.lastSuperFlight;
    //           }
    //           result.superFlights.push(e.superFlightLeg);
    //         } else {
    //           result.superFlights.remove(e.superFlightLeg);
    //           result.superFlights.length > 0 || (result.lastSuperFlight = e.superFlightLeg);
    //         }
    //         return result;
    //       },
    //       { superFlights: [], objections: [] }
    //     ).objections
    // );
  }
}
