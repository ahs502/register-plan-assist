import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { ConstraintTemplate } from '@core/master-data';
import Objection from 'src/business/constraints/Objection';

export default class ValidPeriodCheckOnAircraftsChecker extends Checker {
  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraintTemplate: ConstraintTemplate) {
    super(preplan, constraintSystem, constraintTemplate);
  }

  check(): Objection[] {
    return this.preplan.stagedAircraftRegisters.items
      .filter(a => a.options.status !== 'IGNORED' && !a.validPeriods.some(p => Date.intervalCovers(p.startDate, p.endDate, this.preplan.startDate, this.preplan.endDate)))
      .map(
        a =>
          a.validPeriods.some(p => Date.intervalOverlaps(p.startDate, p.endDate, this.preplan.startDate, this.preplan.endDate))
            ? a.issueObjection('WARNING', 12345, this, constraintMarker => `${constraintMarker}: ${a.marker} valid periods does not fully cover the preplan interval.`) //TODO: Refine this instantiation.
            : a.issueObjection('ERROR', 12345, this, constraintMarker => `${constraintMarker}: ${a.marker} is out of its valid periods for this preplan.`) //TODO: Refine this instantiation.
      );
  }
}
