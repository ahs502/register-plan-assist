import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/preplan/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { Constraint } from '@core/master-data';
import { AircraftRestrictionOnAirportsConstraintData } from '@core/master-data/Constraint';
import PreplanAircraftRegister from 'src/business/preplan/PreplanAircraftRegister';
import PreplanAircraftSelection from 'src/business/preplan/PreplanAircraftSelection';

export default class AircraftRestrictionOnAirportsChecker extends Checker {
  private data: AircraftRestrictionOnAirportsConstraintData;
  private aircraftRegisters: readonly PreplanAircraftRegister[];

  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraint: Constraint) {
    super(preplan, constraintSystem, constraint.template, constraint);
    this.data = constraint.data as AircraftRestrictionOnAirportsConstraintData;
    this.aircraftRegisters = new PreplanAircraftSelection(this.data.aircraftSelection, preplan.aircraftRegisters).aircraftRegisters;
  }

  check(): void {
    this.preplan.flightLegs.forEach(f => {
      if (!f.aircraftRegister || !(this.data.airports.includes(f.departureAirport) || this.data.airports.includes(f.arrivalAirport))) return;
      if (this.data.never !== this.aircraftRegisters.includes(f.aircraftRegister)) return;
      this.data.required
        ? this.issueObjection(f, 'ERROR', 12345, constraintMarker => `${f.marker} can not be planned with ${f.aircraftRegister!.name} due to ${constraintMarker}.`)
        : this.issueObjection(
            f,
            'WARNING',
            12345,
            constraintMarker => `It is better for ${f.marker} to not be planned with ${f.aircraftRegister!.name} due to ${constraintMarker}.`
          );
    });
    this.preplan.flightRequirements.forEach(r => {
      if ([r.route[0].departureAirport, ...r.route.map(l => l.arrivalAirport)].every(a => !this.data.airports.includes(a))) return;
      const commonCount = r.aircraftSelection.aircraftRegisters.filter(a => this.data.never === this.aircraftRegisters.includes(a)).length;
      if (commonCount === r.aircraftSelection.aircraftRegisters.length) {
        this.issueObjection(r, this.data.required ? 'ERROR' : 'WARNING', 12345, constraintMarker => `${r.marker} violates ${constraintMarker}.`);
      } else if (commonCount > 0) {
        this.issueObjection(r, 'WARNING', 12345, constraintMarker => `${r.marker} may violate ${constraintMarker}.`);
      }
      r.days.forEach(d => {
        const commonCount = d.aircraftSelection.aircraftRegisters.filter(a => this.data.never === this.aircraftRegisters.includes(a)).length;
        if (commonCount === d.aircraftSelection.aircraftRegisters.length) {
          this.issueObjection(d, this.data.required ? 'ERROR' : 'WARNING', 12345, constraintMarker => `${d.marker} violates ${constraintMarker}.`);
        } else if (commonCount > 0) {
          this.issueObjection(d, 'WARNING', 12345, constraintMarker => `${d.marker} may violate ${constraintMarker}.`);
        }
      });
    });
  }
}
