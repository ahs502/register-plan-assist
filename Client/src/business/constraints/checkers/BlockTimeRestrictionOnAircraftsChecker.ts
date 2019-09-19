import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { Constraint } from '@core/master-data';
import { BlockTimeRestrictionOnAircraftsConstraintData } from '@core/master-data/Constraint';
import FlightRequirementObjection from 'src/business/constraints/objections/FlightRequirementObjection';
import WeekdayFlightRequirementObjection from 'src/business/constraints/objections/WeekdayFlightRequirementObjection';
import PreplanAircraftRegister from 'src/business/PreplanAircraftRegister';
import PreplanAircraftSelection from 'src/business/PreplanAircraftSelection';

export default class BlockTimeRestrictionOnAircraftsChecker extends Checker {
  private data: BlockTimeRestrictionOnAircraftsConstraintData;
  private aircraftRegisters: readonly PreplanAircraftRegister[];

  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraint: Constraint) {
    super(preplan, constraintSystem, constraint.template, constraint);
    this.data = constraint.data as BlockTimeRestrictionOnAircraftsConstraintData;
    this.aircraftRegisters = new PreplanAircraftSelection(this.data.aircraftSelection, preplan.aircraftRegisters).aircraftRegisters;
  }

  check(): (FlightRequirementObjection | WeekdayFlightRequirementObjection)[] {
    const objections: (FlightRequirementObjection | WeekdayFlightRequirementObjection)[] = [];
    this.preplan.flightRequirements.forEach(r => {
      const commonCount = r.scope.aircraftSelection.aircraftRegisters.filter(a => this.aircraftRegisters.includes(a)).length;
      if (commonCount === r.scope.aircraftSelection.aircraftRegisters.length)
        return objections.push(
          new FlightRequirementObjection('ERROR', 12345, this, r, (constraintMarker, flightRequirementMarker) => `${constraintMarker} is violated by ${flightRequirementMarker}.`)
        ); //TODO: Refine this instantiation.
      if (commonCount > 0)
        return objections.push(
          new FlightRequirementObjection(
            'WARNING',
            12345,
            this,
            r,
            (constraintMarker, flightRequirementMarker) => `${constraintMarker} may be violated by ${flightRequirementMarker}.`
          )
        ); //TODO: Refine this instantiation.
      r.days.forEach(d => {
        const commonCount = d.scope.aircraftSelection.aircraftRegisters.filter(a => this.aircraftRegisters.includes(a)).length;
        if (commonCount === d.scope.aircraftSelection.aircraftRegisters.length)
          return objections.push(
            new WeekdayFlightRequirementObjection(
              'ERROR',
              12345,
              this,
              d,
              (constraintMarker, weekdayFlightRequirementMarker) => `${constraintMarker} is violated by ${weekdayFlightRequirementMarker}.`
            )
          ); //TODO: Refine this instantiation.
        if (commonCount > 0)
          return objections.push(
            new WeekdayFlightRequirementObjection(
              'ERROR',
              12345,
              this,
              d,
              (constraintMarker, weekdayFlightRequirementMarker) => `${constraintMarker} may be violated by ${weekdayFlightRequirementMarker}.`
            )
          ); //TODO: Refine this instantiation.
      });
    });
    return objections;
  }
}
