import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { ConstraintTemplate } from '@core/master-data';
import FlightObjection from 'src/business/constraints/objections/FlightObjection';

export default class FlightRequirementRestrictionOnFlightsChecker extends Checker {
  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraintTemplate: ConstraintTemplate) {
    super(preplan, constraintSystem, constraintTemplate);
  }

  check(): FlightObjection[] {
    const objections: FlightObjection[] = [];
    this.preplan.flights.forEach(f => {
      const requiredFit = !f.weekdayRequirement.scope.required || (f.aircraftRegister && f.aircraftRegister.options.status === 'INCLUDED');
      if (!requiredFit)
        return objections.push(
          //TODO: Refine this instantiation.
          new FlightObjection(
            'ERROR',
            12345,
            this,
            f,
            (constraintMarker, flightMarker) => `${constraintMarker}: ${flightMarker} is required and can not be planned with a backup or without an aircraft register.`
          )
        );

      const aircraftRegisterFit = !f.aircraftRegister || f.weekdayRequirement.scope.aircraftSelection.aircraftRegisters.includes(f.aircraftRegister);
      if (!aircraftRegisterFit)
        return objections.push(
          //TODO: Refine this instantiation.
          new FlightObjection('ERROR', 12345, this, f, (constraintMarker, flightMarker) => `${constraintMarker}: ${flightMarker} is not allowed to go with this aircraft register.`)
        );

      const stdFit = !f.aircraftRegister || f.weekdayRequirement.scope.times.some(t => t.stdLowerBound <= f.std && f.std <= t.stdUpperBound);
      if (!stdFit)
        return objections.push(
          //TODO: Refine this instantiation.
          new FlightObjection('ERROR', 12345, this, f, (constraintMarker, flightMarker) => `${constraintMarker}: ${flightMarker} STD is out of its predefined limits.`)
        );
    });
    return objections;
  }
}
