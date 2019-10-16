import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/preplan/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { ConstraintTemplate } from '@core/master-data';

export default class MinimumGroundTimeBetweenFlightsChecker extends Checker {
  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraintTemplate: ConstraintTemplate) {
    super(preplan, constraintSystem, constraintTemplate);
  }

  check(): void {
    // return Object.keys(this.constraintSystem.flightEventsByRegister).flatMap(
    //   registerId =>
    //     this.constraintSystem.flightEventsByRegister[registerId].reduce<{
    //       superFlights: SuperFlightLeg[];
    //       lastSuperFlight?: SuperFlightLeg;
    //       lastTime: number;
    //       objections: Objection[];
    //     }>(
    //       (result, e) => {
    //         if (e.starting) {
    //           if (result.lastSuperFlight) {
    //             !(e.superFlightLeg.nextRound && result.lastSuperFlight.nextRound) &&
    //               e.time - e.superFlightLeg.flightLeg.getRequiredMinimumGroundTime(this.preplan.startDate, this.preplan.endDate, 'MAXIMUM') < result.lastTime &&
    //               result.objections.push(
    //                 e.superFlightLeg.flightLeg.issueObjection(
    //                   'ERROR',
    //                   12345,
    //                   this,
    //                   constraintMarker => `${constraintMarker}: ${e.superFlightLeg.flightLeg.marker} does not meet enough ground time before take off.`
    //                 )
    //               );
    //             delete result.lastSuperFlight;
    //           }
    //           result.superFlights.push(e.superFlightLeg);
    //         } else {
    //           result.superFlights.remove(e.superFlightLeg);
    //           if (result.superFlights.length === 0) {
    //             result.lastSuperFlight = e.superFlightLeg;
    //             result.lastTime = e.time;
    //           }
    //         }
    //         return result;
    //       },
    //       { superFlights: [], lastTime: 0, objections: [] }
    //     ).objections
    // );
  }
}
