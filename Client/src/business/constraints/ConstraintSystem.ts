import Preplan from 'src/business/Preplan';
import Checker from './Checker';
import Objection from './Objection';
import MasterData, { ConstraintTemplate, Constraint } from '@core/master-data';
import Flight from 'src/business/flights/Flight';

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

export interface SuperFlight {
  flight: Flight;
  nextRound: boolean;
}
export interface FlightEvent {
  starting: boolean;
  time: number;
  superFlight: SuperFlight;
}
export interface FlightEventDictionary {
  [aircraftRegisterId: string]: readonly FlightEvent[];
}

export default class ConstraintSystem {
  readonly checkers: readonly Checker[];
  readonly objections: readonly Objection[];
  private stagedObjections: readonly Objection[];

  constructor(readonly preplan: Preplan) {
    this.checkers = MasterData.all.constraintTemplates.items
      .filter(t => !t.instantiable)
      .map(t => this.createCheckerFromNonInstantiableConstraintTemplate(preplan, t))
      .concat(
        MasterData.all.constraints.items
          .filter(c => true /*TODO: See if the scope of this constraint overlaps the intended preplan */)
          .map(c => this.createCheckerFromConstraint(preplan, c))
      );
    this.stagedObjections = this.objections = this.check();
    this.commit();
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

  private check(): Objection[] {
    return Objection.sort(this.checkers.flatMap(checker => checker.check()));
  }

  stage(): ObjectionDiff {
    this.stagedObjections = this.check();
    const introduced: Objection[] = [];
    const modified: Objection[] = [];
    this.stagedObjections.forEach(s => {
      const o = this.objections.find(objection => objection.derivedId === s.derivedId);
      if (!o) return introduced.push(s);
      if (o.message === s.message) return;
      modified.push(s);
    });
    const resolved = this.objections.filter(o => !this.stagedObjections.some(s => o.derivedId === s.derivedId));
    return { introduced, resolved, modified };
  }
  commit(): void {
    (this as { objections: readonly Objection[] }).objections = this.stagedObjections;

    // Remove already assigned objections
    this.preplan.flights.forEach(f => delete f.objections);
    this.preplan.flightRequirements.forEach(r => {
      delete r.objections;
      r.days.forEach(d => delete d.objections);
    });
    this.preplan.aircraftRegisters.items.forEach(a => delete a.objections);

    // Assign new objections
    this.objections.forEach(o => {
      o.target.objections || (o.target.objections = []);
      o.target.objections.push(o);
    });
  }

  private _flights?: readonly Flight[];
  private _flightEventsByRegister?: FlightEventDictionary;
  /**
   * A dictionary of ascending time sorted flight events by aircraft register id (except for unknown register '???').
   * It won't be changed by reference until something is changed within.
   * There are four events per each flight: two for its start and end times and
   * another two for the same thing for the flight's next week round.
   */
  get flightEventsByRegister(): FlightEventDictionary {
    if (this.preplan.flights !== this._flights) delete this._flightEventsByRegister;
    if (this._flightEventsByRegister) return this._flightEventsByRegister;
    this._flights = this.preplan.flights;
    return (this._flightEventsByRegister = Object.keys(this.preplan.flightsByRegister).reduce<FlightEventDictionary>((dictionary, registerId) => {
      if (registerId === '???') return dictionary;
      dictionary[registerId] = this.preplan.flightsByRegister[registerId]
        .flatMap<FlightEvent>(f => {
          const superFlight = { flight: f, nextRound: false };
          const nextRoundSuperFlight = { flight: f, nextRound: true };
          return [
            { starting: true, time: f.weekStd, superFlight },
            { starting: false, time: f.weekSta, superFlight },
            { starting: true, time: f.weekStd + 7 * 24 * 60, superFlight: nextRoundSuperFlight },
            { starting: false, time: f.weekSta + 7 * 24 * 60, superFlight: nextRoundSuperFlight }
          ];
        })
        .sortBy(e => e.time);
      return dictionary;
    }, {}));
  }
}
