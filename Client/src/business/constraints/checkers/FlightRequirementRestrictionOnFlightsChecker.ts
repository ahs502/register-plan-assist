import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/preplan/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { ConstraintTemplate } from '@core/master-data';

export default class FlightRequirementRestrictionOnFlightsChecker extends Checker {
  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraintTemplate: ConstraintTemplate) {
    super(preplan, constraintSystem, constraintTemplate);
  }

  check(): void {
    // const objections: Objection[] = [];
    // this.constraintSystem.flights.forEach(f => {
    //   const requiredFit = !f.weekdayRequirement.scope.required || (f.aircraftRegister && f.aircraftRegister.options.status === 'INCLUDED');
    //   if (!requiredFit)
    //     return objections.push(
    //       f.issueObjection(
    //         'ERROR',
    //         12345,
    //         this,
    //         constraintMarker => `${constraintMarker}: ${f.marker} is required and can not be planned with a backup or without an aircraft register.`
    //       )
    //     );
    //   const aircraftRegisterFit = !f.aircraftRegister || f.weekdayRequirement.scope.aircraftSelection.aircraftRegisters.includes(f.aircraftRegister);
    //   if (!aircraftRegisterFit)
    //     return objections.push(f.issueObjection('ERROR', 12345, this, constraintMarker => `${constraintMarker}: ${f.marker} is not allowed to go with this aircraft register.`));
    //   const stdFit = !f.aircraftRegister || f.weekdayRequirement.scope.times.some(t => t.stdLowerBound <= f.std && f.std <= t.stdUpperBound);
    //   if (!stdFit) return objections.push(f.issueObjection('ERROR', 12345, this, constraintMarker => `${constraintMarker}: ${f.marker} STD is out of its predefined limits.`));
    // });
    // return objections;
  }
}
