import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/Preplan';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import { Constraint } from '@core/master-data';
import { AircraftRestrictionOnAirportsConstraintData } from '@core/master-data/Constraint';
import FlightRequirementObjection from 'src/business/constraints/objections/FlightRequirementObjection';
import WeekdayFlightRequirementObjection from 'src/business/constraints/objections/WeekdayFlightRequirementObjection';
import FlightObjection from 'src/business/constraints/objections/FlightObjection';
import PreplanAircraftRegister from 'src/business/PreplanAircraftRegister';
import PreplanAircraftSelection from 'src/business/PreplanAircraftSelection';

export default class AircraftRestrictionOnAirportsChecker extends Checker {
  private data: AircraftRestrictionOnAirportsConstraintData;
  private aircraftRegisters: readonly PreplanAircraftRegister[];

  constructor(preplan: Preplan, constraintSystem: ConstraintSystem, constraint: Constraint) {
    super(preplan, constraintSystem, constraint.template, constraint);
    this.data = constraint.data as AircraftRestrictionOnAirportsConstraintData;
    this.aircraftRegisters = new PreplanAircraftSelection(this.data.aircraftSelection, preplan.aircraftRegisters).aircraftRegisters;
  }

  check(): (FlightRequirementObjection | WeekdayFlightRequirementObjection | FlightObjection)[] {
    const objections: (FlightRequirementObjection | WeekdayFlightRequirementObjection | FlightObjection)[] = [];
    this.preplan.flights.forEach(f => {
      if (!f.aircraftRegister || !(this.data.airports.includes(f.departureAirport) || this.data.airports.includes(f.arrivalAirport))) return;
      if (this.data.never === this.aircraftRegisters.includes(f.aircraftRegister)) {
        if (this.data.required)
          return new FlightObjection(
            'ERROR',
            12345,
            this,
            f,
            (constraintMarker, flightMarker) => `${flightMarker} can not be planned with ${f.aircraftRegister!.name} due to ${constraintMarker}.`
          ); //TODO: Refine this instantiation.
        return new FlightObjection(
          'WARNING',
          12345,
          this,
          f,
          (constraintMarker, flightMarker) => `It is better for ${flightMarker} to not be planned with ${f.aircraftRegister!.name} due to ${constraintMarker}.`
        ); //TODO: Refine this instantiation.
      }
    });
    this.preplan.flightRequirements.forEach(r => {
      if (this.data.airports.includes(r.definition.departureAirport) || this.data.airports.includes(r.definition.arrivalAirport)) {
        const commonCount = r.scope.aircraftSelection.aircraftRegisters.filter(a => this.data.never === this.aircraftRegisters.includes(a)).length;
        if (commonCount === r.scope.aircraftSelection.aircraftRegisters.length)
          return new FlightRequirementObjection(
            this.data.required ? 'ERROR' : 'WARNING',
            12345,
            this,
            r,
            (constraintMarker, flightRequirementMarker) => `${flightRequirementMarker} violates ${constraintMarker}.`
          ); //TODO: Refine this instantiation.
        if (commonCount > 0)
          return new FlightRequirementObjection(
            'WARNING',
            12345,
            this,
            r,
            (constraintMarker, flightRequirementMarker) => `${flightRequirementMarker} may violate ${constraintMarker}.`
          ); //TODO: Refine this instantiation.
      }
      r.days.forEach(d => {
        if (this.data.airports.includes(d.definition.departureAirport) || this.data.airports.includes(d.definition.arrivalAirport)) {
          const commonCount = d.scope.aircraftSelection.aircraftRegisters.filter(a => this.data.never === this.aircraftRegisters.includes(a)).length;
          if (commonCount === d.scope.aircraftSelection.aircraftRegisters.length)
            return new WeekdayFlightRequirementObjection(
              this.data.required ? 'ERROR' : 'WARNING',
              12345,
              this,
              d,
              (constraintMarker, weekdayFlightRequirementMarker) => `${weekdayFlightRequirementMarker} violates ${constraintMarker}.`
            ); //TODO: Refine this instantiation.
          if (commonCount > 0)
            return new WeekdayFlightRequirementObjection(
              'WARNING',
              12345,
              this,
              d,
              (constraintMarker, weekdayFlightRequirementMarker) => `${weekdayFlightRequirementMarker} may violate ${constraintMarker}.`
            ); //TODO: Refine this instantiation.
        }
      });
    });
    return objections;
  }
}
