import Preplan from 'src/business/Preplan';
import Checker from './Checker';
import Objection from './Objection';
import MasterData, { ConstraintTemplate, Constraint } from '@core/master-data';

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

export interface ObjectionDiff {
  introduced: Objection[];
  resolved: Objection[];
  modified: Objection[];
}

export default class ConstraintSystem {
  readonly checkers: readonly Checker[];
  readonly objections: readonly Objection[];
  private stagedObjections: readonly Objection[];

  constructor(readonly preplan: Preplan) {
    this.checkers = MasterData.all.constraintTemplates.items
      .filter(t => !t.instantiable)
      .map(t => createCheckerFromNonInstantiableConstraintTemplate(preplan, t))
      .concat(
        MasterData.all.constraints.items
          .filter(c => true /*TODO: See if the scope of this constraint overlaps the intended preplan */)
          .map(c => createCheckerFromConstraint(preplan, c))
      );
    this.objections = this.check();
    this.stagedObjections = [];
  }

  private check(): Objection[] {
    return this.checkers.flatMap(checker => checker.check()).sortBy('priority', 'message');
  }

  stage(): ObjectionDiff {
    this.stagedObjections = this.check();
    const introduced: Objection[] = [];
    const modified: Objection[] = [];
    this.stagedObjections.forEach(s => {
      const o = this.objections.find(objection => objection.match(s));
      if (!o) return introduced.push(s);
      if (o.message === s.message) return;
      modified.push(s);
    });
    const resolved = this.objections.filter(o => !this.stagedObjections.some(s => o.match(s)));
    return { introduced, resolved, modified };
  }
  commit(): void {
    (this as { objections: readonly Objection[] }).objections = this.stagedObjections;
  }
}

function createCheckerFromNonInstantiableConstraintTemplate(preplan: Preplan, constraintTemplate: ConstraintTemplate): Checker {
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
function createCheckerFromConstraint(preplan: Preplan, constraint: Constraint): Checker {
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
