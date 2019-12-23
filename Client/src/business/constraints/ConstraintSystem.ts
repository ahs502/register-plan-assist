import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import FlightLeg from 'src/business/flight/FlightLeg';
import Checker from 'src/business/constraints/Checker';
import Preplan from 'src/business/preplan/Preplan';
import MasterData, { ConstraintTemplate, Constraint } from 'src/business/master-data';
import Objectionable from 'src/business/constraints/Objectionable';

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

export type ObjectionStatus = 'NONE' | ObjectionType;

export interface ObjecitonChanges {
  readonly introduced: readonly Objection[];
  readonly resolved: readonly Objection[];
  readonly modified: readonly Objection[];
}

export interface SuperFlightLeg {
  readonly flightLeg: FlightLeg;
  readonly secondRound: boolean;
}
export interface FlightLegEvent {
  readonly starting: boolean;
  readonly time: number;
  readonly superFlightLeg: SuperFlightLeg;
}

export default class ConstraintSystem {
  readonly checkers: readonly Checker[];

  readonly flightLegEventsByAircraftRegisterId: { readonly [aircraftRegisterId: string]: readonly FlightLegEvent[] };

  readonly objections: readonly Objection[];
  readonly objectionChanges: ObjecitonChanges;
  readonly objectionsByTarget: { readonly [targetConstructor: string]: { readonly [targetId: string]: readonly Objection[] } };

  constructor(readonly preplan: Preplan, oldConstraintSystem?: ConstraintSystem) {
    this.checkers = [
      ...MasterData.all.constraintTemplates.items.filter(t => !t.instantiable).map(t => this.createCheckerFromNonInstantiableConstraintTemplate(preplan, t)),
      ...MasterData.all.constraints.items
        .filter(c => true /*TODO: See if the scope of this constraint overlaps the intended preplan */)
        .map(c => this.createCheckerFromConstraint(preplan, c))
    ];

    const flightLegEventsByAircraftRegisterId: { [aircraftRegisterId: string]: FlightLegEvent[] } = (this.flightLegEventsByAircraftRegisterId = {});
    this.preplan.aircraftRegisters.items
      .filter(a => a.options.status !== 'IGNORED')
      .forEach(
        a =>
          (flightLegEventsByAircraftRegisterId[a.id] = this.preplan.flightLegsByAircraftRegisterId[a.id]
            .map<FlightLegEvent[]>(l => {
              const superFlightLeg = { flightLeg: l, secondRound: false };
              const secondRoundSuperFlightLeg = { flightLeg: l, secondRound: true };
              return [
                { starting: true, time: l.weekStd, superFlightLeg: superFlightLeg },
                { starting: false, time: l.weekSta, superFlightLeg: superFlightLeg },
                { starting: true, time: l.weekStd + 7 * 24 * 60, superFlightLeg: secondRoundSuperFlightLeg },
                { starting: false, time: l.weekSta + 7 * 24 * 60, superFlightLeg: secondRoundSuperFlightLeg }
              ];
            })
            .flatten()
            .sortBy(e => e.time))
      );

    this.objections = Objection.sort(this.checkers.flatMap(checker => checker.makeObjections()));

    const oldObjections = oldConstraintSystem ? oldConstraintSystem.objections : [];
    const introduced: Objection[] = [];
    const modified: Objection[] = [];
    this.objections.forEach(s => {
      const o = oldObjections.find(objection => objection.derivedId === s.derivedId);
      if (!o) return introduced.push(s);
      if (o.message === s.message) return;
      modified.push(s);
    });
    const resolved = oldObjections.filter(o => !this.objections.some(s => o.derivedId === s.derivedId));
    this.objectionChanges = { introduced, resolved, modified };

    const objectionsByTarget: { [targetConstructor: string]: { [targetId: string]: Objection[] } } = (this.objectionsByTarget = {});
    this.objections.forEach(objection => {
      const targetConstructor = (objection.target as Object).constructor.name;
      targetConstructor in objectionsByTarget || (objectionsByTarget[targetConstructor] = {});
      objection.targetId in objectionsByTarget[targetConstructor] || (objectionsByTarget[targetConstructor][objection.targetId] = []);
      objectionsByTarget[targetConstructor][objection.targetId].push(objection);
    });
  }

  private createCheckerFromNonInstantiableConstraintTemplate(preplan: Preplan, constraintTemplate: ConstraintTemplate): Checker {
    switch (constraintTemplate.type) {
      case 'NO_CONFLICTION_IN_FLIGHTS':
        return new NoConflictionOnFlightsChecker(preplan, this, constraintTemplate);
      case 'AIRPORT_SEQUENCE_RESTRICTION_ON_FLIGHTS':
        return new AirportSequenceRestrictionOnFlightsChecker(preplan, this, constraintTemplate);
      case 'MINIMUM_GROUND_TIME_BETWEEN_FLIGHTS':
        return new MinimumGroundTimeBetweenFlightsChecker(preplan, this, constraintTemplate);
      case 'VALID_PERIOD_CHECK_ON_AIRCRAFTS':
        return new ValidPeriodCheckOnAircraftsChecker(preplan, this, constraintTemplate);
      case 'FLIGHT_REQUIREMENT_RESTRICTION_ON_FLIGHTS':
        return new FlightRequirementRestrictionOnFlightsChecker(preplan, this, constraintTemplate);
      default:
        throw 'Unsupported constraint template.';
    }
  }
  private createCheckerFromConstraint(preplan: Preplan, constraint: Constraint): Checker {
    switch (constraint.template.type) {
      case 'AIRCRAFT_RESTRICTION_ON_AIRPORTS':
        return new AircraftRestrictionOnAirportsChecker(preplan, this, constraint);
      case 'AIRPORT_RESTRICTION_ON_AIRCRAFTS':
        return new AirportRestrictionOnAircraftsChecker(preplan, this, constraint);
      case 'BLOCK_TIME_RESTRICTION_ON_AIRCRAFTS':
        return new BlockTimeRestrictionOnAircraftsChecker(preplan, this, constraint);
      case 'ROUTE_SEQUENCE_RESTRICTION_ON_AIRPORTS':
        return new RouteSequenceRestrictionOnAirportsChecker(preplan, this, constraint);
      case 'AIRPORT_ALLOCATION_PRIORITY_FOR_AIRCRAFTS':
        return new AirportAllocationPriorityForAircraftsChecker(preplan, this, constraint);
      default:
        throw 'Unsupported constraint';
    }
  }

  getObjectionsByTarget(target: Objectionable, skipDependencies?: boolean): readonly Objection[] {
    return (skipDependencies || !target.objectionStatusDependencies ? [target] : [target, ...target.objectionStatusDependencies]).flatMap(target => {
      const targetConstructor = (target as Object).constructor.name;
      if (!(targetConstructor in this.objectionsByTarget)) return [];
      const targetId = (target.id || target.derivedId)!;
      if (!(targetId in this.objectionsByTarget[targetConstructor])) return [];
      return this.objectionsByTarget[targetConstructor][targetId];
    });
  }
  getObjectionStatusByTarget(target: Objectionable, skipDependencies?: boolean): ObjectionStatus {
    const targets = skipDependencies || !target.objectionStatusDependencies ? [target] : [target, ...target.objectionStatusDependencies];
    let warning = false;
    for (const target of targets) {
      const targetObjections = this.getObjectionsByTarget(target, true);
      if (targetObjections.length === 0) continue;
      if (targetObjections.some(o => o.type === 'ERROR')) return 'ERROR';
      warning = true;
    }
    return warning ? 'WARNING' : 'NONE';
  }
}
