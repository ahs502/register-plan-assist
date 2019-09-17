import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { ConstraintTemplate } from '@core/master-data';
import AircraftRegisterObjection from 'src/business/constraints/objections/AircraftRegisterObjection';

export default class ValidPeriodCheckOnAircraftsChecker extends Checker {
  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraintTemplate: ConstraintTemplate) {
    super(preplan, constraintSystem, constraintTemplate);
  }

  check(): AircraftRegisterObjection[] {
    return this.preplan.aircraftRegisters.items
      .filter(a => a.options.status !== 'IGNORED' && !a.validPeriods.some(p => Date.intervalCovers(p.startDate, p.endDate, this.preplan.startDate, this.preplan.endDate)))
      .map(
        a =>
          a.validPeriods.some(p => Date.intervalOverlaps(p.startDate, p.endDate, this.preplan.startDate, this.preplan.endDate))
            ? new AircraftRegisterObjection(
                'WARNING',
                12345,
                this,
                a,
                (constraintMarker, aircraftRegisterMarker) => `${constraintMarker}: ${aircraftRegisterMarker} valid periods does not fully cover the preplan interval.`
              ) //TODO: Refine this instantiation.
            : new AircraftRegisterObjection(
                'ERROR',
                12345,
                this,
                a,
                (constraintMarker, aircraftRegisterMarker) => `${constraintMarker}: ${aircraftRegisterMarker} is out of its valid periods for this preplan.`
              ) //TODO: Refine this instantiation.
      );
  }
}
