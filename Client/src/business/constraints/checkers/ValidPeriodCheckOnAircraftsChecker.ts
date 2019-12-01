import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/preplan/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { ConstraintTemplate } from '@core/master-data';

export default class ValidPeriodCheckOnAircraftsChecker extends Checker {
  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraintTemplate: ConstraintTemplate) {
    super(preplan, constraintSystem, constraintTemplate);
  }

  check(): void {
    this.preplan.aircraftRegisters.items
      .filter(a => a.options.status !== 'IGNORED' && !a.validPeriods.some(p => Date.intervalCovers(p.startDate, p.endDate, this.preplan.startDate, this.preplan.endDate)))
      .map(a =>
        a.validPeriods.some(p => Date.intervalOverlaps(p.startDate, p.endDate, this.preplan.startDate, this.preplan.endDate))
          ? this.issueObjection(a, 'WARNING', 12345, constraintMarker => `${constraintMarker}: ${a.marker} valid periods does not fully cover the preplan interval.`)
          : this.issueObjection(a, 'ERROR', 12345, constraintMarker => `${constraintMarker}: ${a.marker} is out of its valid periods for this preplan.`)
      );
  }
}
