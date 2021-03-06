import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/preplan/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { Constraint } from 'src/business/master-data';
import { BlockTimeRestrictionOnAircraftsConstraintData } from 'src/business/master-data/Constraint';
import PreplanAircraftRegister from 'src/business/preplan/PreplanAircraftRegister';
import PreplanAircraftSelection from 'src/business/preplan/PreplanAircraftSelection';

export default class BlockTimeRestrictionOnAircraftsChecker extends Checker {
  private data: BlockTimeRestrictionOnAircraftsConstraintData;
  private aircraftRegisters: readonly PreplanAircraftRegister[];

  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraint: Constraint) {
    super(preplan, constraintSystem, constraint.template, constraint);
    this.data = constraint.data as BlockTimeRestrictionOnAircraftsConstraintData;
    this.aircraftRegisters = new PreplanAircraftSelection(this.data.aircraftSelection, preplan.aircraftRegisters).aircraftRegisters;
  }

  check(): void {
    // const objections: Objection[] = [];
    // this.preplan.stagedFlightRequirements.forEach(r => {
    //   const commonCount = r.scope.aircraftSelection.aircraftRegisters.filter(a => this.aircraftRegisters.includes(a)).length;
    //   if (commonCount === r.scope.aircraftSelection.aircraftRegisters.length)
    //     return objections.push(r.issueObjection('ERROR', 12345, this, constraintMarker => `${constraintMarker} is violated by ${r.marker}.`));
    //   if (commonCount > 0) return objections.push(r.issueObjection('WARNING', 12345, this, constraintMarker => `${constraintMarker} may be violated by ${r.marker}.`));
    //   r.days.forEach(d => {
    //     const commonCount = d.scope.aircraftSelection.aircraftRegisters.filter(a => this.aircraftRegisters.includes(a)).length;
    //     if (commonCount === d.scope.aircraftSelection.aircraftRegisters.length)
    //       return objections.push(d.issueObjection('ERROR', 12345, this, constraintMarker => `${constraintMarker} is violated by ${d.marker}.`));
    //     if (commonCount > 0) return objections.push(d.issueObjection('ERROR', 12345, this, constraintMarker => `${constraintMarker} may be violated by ${d.marker}.`)); //TODO: Refine this instantiation.
    //   });
    // });
    // return objections;
  }
}
