import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { Constraint } from '@core/master-data';
import { AircraftRestrictionOnAirportsConstraintData } from '@core/master-data/Constraint';
import PreplanAircraftRegister from 'src/business/PreplanAircraftRegister';
import PreplanAircraftSelection from 'src/business/PreplanAircraftSelection';
import Objection from 'src/business/constraints/Objection';

export default class AircraftRestrictionOnAirportsChecker extends Checker {
  private data: AircraftRestrictionOnAirportsConstraintData;
  private aircraftRegisters: readonly PreplanAircraftRegister[];

  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraint: Constraint) {
    super(preplan, constraintSystem, constraint.template, constraint);
    this.data = constraint.data as AircraftRestrictionOnAirportsConstraintData;
    this.aircraftRegisters = new PreplanAircraftSelection(this.data.aircraftSelection, preplan.aircraftRegisters).aircraftRegisters;
  }

  check(): Objection[] {
    const objections: Objection[] = [];
    this.preplan.flights.forEach(f => {
      if (!f.aircraftRegister || !(this.data.airports.includes(f.departureAirport) || this.data.airports.includes(f.arrivalAirport))) return;
      if (this.data.never === this.aircraftRegisters.includes(f.aircraftRegister))
        return this.data.required
          ? f.issueObjection('ERROR', 12345, this, constraintMarker => `${f.marker} can not be planned with ${f.aircraftRegister!.name} due to ${constraintMarker}.`)
          : f.issueObjection(
              'WARNING',
              12345,
              this,
              constraintMarker => `It is better for ${f.marker} to not be planned with ${f.aircraftRegister!.name} due to ${constraintMarker}.`
            );
    });
    this.preplan.flightRequirements.forEach(r => {
      if (this.data.airports.includes(r.definition.departureAirport) || this.data.airports.includes(r.definition.arrivalAirport)) {
        const commonCount = r.scope.aircraftSelection.aircraftRegisters.filter(a => this.data.never === this.aircraftRegisters.includes(a)).length;
        if (commonCount === r.scope.aircraftSelection.aircraftRegisters.length)
          return r.issueObjection(this.data.required ? 'ERROR' : 'WARNING', 12345, this, constraintMarker => `${r.marker} violates ${constraintMarker}.`);
        if (commonCount > 0) return r.issueObjection('WARNING', 12345, this, constraintMarker => `${r.marker} may violate ${constraintMarker}.`); //TODO: Refine this instantiation.
      }
      r.days.forEach(d => {
        if (this.data.airports.includes(d.definition.departureAirport) || this.data.airports.includes(d.definition.arrivalAirport)) {
          const commonCount = d.scope.aircraftSelection.aircraftRegisters.filter(a => this.data.never === this.aircraftRegisters.includes(a)).length;
          if (commonCount === d.scope.aircraftSelection.aircraftRegisters.length)
            return d.issueObjection(this.data.required ? 'ERROR' : 'WARNING', 12345, this, constraintMarker => `${d.marker} violates ${constraintMarker}.`);
          if (commonCount > 0) return d.issueObjection('WARNING', 12345, this, constraintMarker => `${d.marker} may violate ${constraintMarker}.`);
        }
      });
    });
    return objections;
  }
}
