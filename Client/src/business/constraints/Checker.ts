import { Constraint } from '@core/master-data';
import ConstraintTemplate from '@core/master-data/ConstraintTemplate';
import Preplan from 'src/business/Preplan';
import Objection from './Objection';
import NoConflictionOnFlightsChecker from './checkers/NoConflictionOnFlightsChecker';
import AirportSequenceRestrictionOnFlightsChecker from './checkers/AirportSequenceRestrictionOnFlightsChecker';
import MinimumGroundTimeBetweenFlightsChecker from './checkers/MinimumGroundTimeBetweenFlightsChecker';
import ValidPeriodCheckOnAircraftsChecker from './checkers/ValidPeriodCheckOnAircraftsChecker';
import FlightRequirementRestrictionOnFlightsChecker from './checkers/FlightRequirementRestrictionOnFlightsChecker';
import AircraftRestrictionOnAirportsChecker from './checkers/AircraftRestrictionOnAirportsChecker';
import AirportRestrictionOnAircraftsChecker from './checkers/AirportRestrictionOnAircraftsChecker';
import BlockTimeRestrictionOnAircraftsChecker from './checkers/BlockTimeRestrictionOnAircraftsChecker';
import RouteSequenceRestrictionOnAirportsChecker from './checkers/RouteSequenceRestrictionOnAirportsChecker';
import AirportAllocationPriorityForAircraftsChecker from './checkers/AirportAllocationPriorityForAircraftsChecker';

export default abstract class Checker {
  readonly derivedId: string;

  protected constructor(private readonly preplan: Preplan, readonly constraintTemplate: ConstraintTemplate, readonly constraint?: Constraint) {
    this.derivedId = constraint ? `${constraintTemplate.id}-${constraint.id}` : constraintTemplate.id;
  }

  static createFromNonInstantiableConstraintTemplate(preplan: Preplan, constraintTemplate: ConstraintTemplate): Checker {
    switch (constraintTemplate.type) {
      case 'NO_CONFLICTION_IN_FLIGHTS':
        return new NoConflictionOnFlightsChecker(preplan, constraintTemplate);
      case 'AIRPORT_SEQUENCE_RESTRICTION_ON_FLIGHTS':
        return new AirportSequenceRestrictionOnFlightsChecker(preplan, constraintTemplate);
      case 'MINIMUM_GROUND_TIME_BETWEEN_FLIGHTS':
        return new MinimumGroundTimeBetweenFlightsChecker(preplan, constraintTemplate);
      case 'VALID_PERIOD_CHECK_ON_AIRCRAFTS':
        return new ValidPeriodCheckOnAircraftsChecker(preplan, constraintTemplate);
      case 'FLIGHT_REQUIREMENT_RESTRICTION_ON_FLIGHTS':
        return new FlightRequirementRestrictionOnFlightsChecker(preplan, constraintTemplate);
      default:
        throw 'Unsupported constraint template.';
    }
  }
  static createFromConstraint(preplan: Preplan, constraint: Constraint): Checker {
    switch (constraint.template.type) {
      case 'AIRCRAFT_RESTRICTION_ON_AIRPORTS':
        return new AircraftRestrictionOnAirportsChecker(preplan, constraint);
      case 'AIRPORT_RESTRICTION_ON_AIRCRAFTS':
        return new AirportRestrictionOnAircraftsChecker(preplan, constraint);
      case 'BLOCK_TIME_RESTRICTION_ON_AIRCRAFTS':
        return new BlockTimeRestrictionOnAircraftsChecker(preplan, constraint);
      case 'ROUTE_SEQUENCE_RESTRICTION_ON_AIRPORTS':
        return new RouteSequenceRestrictionOnAirportsChecker(preplan, constraint);
      case 'AIRPORT_ALLOCATION_PRIORITY_FOR_AIRCRAFTS':
        return new AirportAllocationPriorityForAircraftsChecker(preplan, constraint);
      default:
        throw 'Unsupported constraint';
    }
  }

  abstract check(): Objection[];
}
