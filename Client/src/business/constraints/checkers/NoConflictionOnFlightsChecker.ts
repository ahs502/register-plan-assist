import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/preplan/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { ConstraintTemplate } from 'src/business/master-data';

export default class NoConflictionOnFlightsChecker extends Checker {
  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraintTemplate: ConstraintTemplate) {
    super(preplan, constraintSystem, constraintTemplate);
  }

  check(): void {
    // return Object.keys(this.constraintSystem.flightEventsByRegister).flatMap(
    //   registerId =>
    //     this.constraintSystem.flightEventsByRegister[registerId].reduce<{ superFlights: SuperFlightLeg[]; objections: Objection[] }>(
    //       (result, e) => {
    //         if (e.starting) {
    //           result.superFlights.forEach(
    //             s =>
    //               !(e.superFlightLeg.nextRound && s.nextRound) &&
    //               result.objections.push(
    //                 e.superFlightLeg.flightLeg.issueObjection(
    //                   'ERROR',
    //                   12345,
    //                   this,
    //                   constraintMarker =>
    //                     `${constraintMarker} and ${e.superFlightLeg.flightLeg.marker} conflicts with ${s.flightLeg.label}, ${s.flightLeg.departureAirport.name}-${s.flightLeg.arrivalAirport.name}.`
    //                 )
    //               )
    //           );
    //           result.superFlights.push(e.superFlightLeg);
    //         } else {
    //           result.superFlights.remove(e.superFlightLeg);
    //         }
    //         return result;
    //       },
    //       { superFlights: [], objections: [] }
    //     ).objections
    // );
  }
}
