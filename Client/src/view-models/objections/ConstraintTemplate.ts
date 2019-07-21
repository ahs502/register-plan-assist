import ConstraintTemplateType from '@core/types/ConstraintTemplateType';
import { Constraint as MasterDataConstraint } from '@core/master-data';
import Constraint from './constraints/Constraint';

import AircraftRestrictionOnAirportsConstraint from './constraints/AircraftRestrictionOnAirportsConstraint';
import BlickTimeRestrictionOnAircraftsConstraint from './constraints/BlickTimeRestrictionOnAircraftsConstraint';
import RouteSequenceRestrictionOnAirportsConstraint from './constraints/RouteSequenceRestrictionOnAirportsConstraint';
import AirportAllocationPriorityForAircraftsConstraint from './constraints/AirportAllocationPriorityForAircraftsConstraint';
import FlightRequirementRestrictionOnFlightsConstraint from './constraints/FlightRequirementRestrictionOnFlightsConstraint';
import AirportSequenceRestrictionOnFlightsConstraint from './constraints/AirportSequenceRestrictionOnFlightsConstraint';
import NoConflictionOnFlightsConstraint from './constraints/NoConflictionOnFlightsConstraint';
import MinimumGroundTimeBetweenFlightsConstraint from './constraints/MinimumGroundTimeBetweenFlightsConstraint';
import ValidPeriodCheckOnAircraftsConstraint from './constraints/ValidPeriodCheckOnAircraftsConstraint';

interface NonGeneralConstraintConstructor {
  new (masterDataConstraint: MasterDataConstraint): Constraint;
}
interface GeneralConstraintConstructor {
  new (): Constraint;
}

export default class ConstraintTemplate {
  readonly classConstructor: NonGeneralConstraintConstructor | GeneralConstraintConstructor;
  readonly type: ConstraintTemplateType;
  readonly name: string;
  readonly general: boolean;
  readonly description: readonly string[];

  private constructor(
    classConstructor: NonGeneralConstraintConstructor | GeneralConstraintConstructor,
    type: ConstraintTemplateType,
    name: string,
    general: boolean,
    ...description: readonly string[]
  ) {
    this.classConstructor = classConstructor;
    this.type = type;
    this.name = name;
    this.general = general;
    this.description = description;
  }

  instantiate(masterDataConstraint?: MasterDataConstraint): Constraint {
    if ((this.general && masterDataConstraint) || (!this.general && !masterDataConstraint)) throw 'Unmatch master data constraint supply.';
    if (this.general) return new (this.classConstructor as GeneralConstraintConstructor)();
    return new (this.classConstructor as NonGeneralConstraintConstructor)(masterDataConstraint!);
  }
  static instantiate(masterDataConstraint: MasterDataConstraint): Constraint {
    return ConstraintTemplate.all[masterDataConstraint.type].instantiate(masterDataConstraint);
  }
  static instantiateAll(masterDataConstraints: readonly MasterDataConstraint[]): readonly Constraint[] {
    return ConstraintTemplate.generalTemplates.map(c => c.instantiate()).concat(masterDataConstraints.map(ConstraintTemplate.instantiate));
  }

  static get nonGeneralTemplates(): readonly ConstraintTemplate[] {
    return Object.values(ConstraintTemplate.all).filter(c => !c.general);
  }
  static get generalTemplates(): readonly ConstraintTemplate[] {
    return Object.values(ConstraintTemplate.all).filter(c => c.general);
  }

  static all: { [type in ConstraintTemplateType]: ConstraintTemplate } = {
    AIRCRAFT_RESTRICTION_ON_AIRPORTS: new ConstraintTemplate(
      AircraftRestrictionOnAirportsConstraint,
      'AIRCRAFT_RESTRICTION_ON_AIRPORTS',
      'Aircraft Restriction on Airports',
      false,
      'When planning the flights of',
      'some airports',
      ',',
      'never / only',
      'use',
      'some aircrafts',
      '.'
    ),

    BLOCK_TIME_RESTRICTION_ON_AIRCRAFTS: new ConstraintTemplate(
      BlickTimeRestrictionOnAircraftsConstraint,
      'BLOCK_TIME_RESTRICTION_ON_AIRCRAFTS',
      'Block Time Restriction on Aircrafts',
      false,
      'When planning flights longer than',
      'some block time',
      ', never use',
      'some aircrafts',
      '.'
    ),

    ROUTE_SEQUENCE_RESTRICTION_ON_AIRPORTS: new ConstraintTemplate(
      RouteSequenceRestrictionOnAirportsConstraint,
      'ROUTE_SEQUENCE_RESTRICTION_ON_AIRPORTS',
      'Route Sequence Restriction on Airports',
      false,
      'Never plan the flights of',
      'some airport',
      'right after the flights of',
      'some other airport',
      '.'
    ),

    AIRPORT_RESTRICTION_ON_AIRCRAFTS: new ConstraintTemplate(
      AirportAllocationPriorityForAircraftsConstraint,
      'AIRPORT_RESTRICTION_ON_AIRCRAFTS',
      'Airport Restriction on Aircrafts',
      false,
      'Never assign',
      'some aircrafts',
      'to the flights of any airport, except for',
      'some airport',
      '.'
    ),

    AIRPORT_ALLOCATION_PRIORITY_FOR_AIRCRAFTS: new ConstraintTemplate(
      AirportAllocationPriorityForAircraftsConstraint,
      'AIRPORT_ALLOCATION_PRIORITY_FOR_AIRCRAFTS',
      'Airport Allocation Priority for Aircrafts',
      false,
      'Assign',
      'some aircrafts',
      'to the flights of',
      'some airports',
      ', prioritized by order, as much as possible.'
    ),

    FLIGHT_REQUIREMENT_RESTRICTION_ON_FLIGHTS: new ConstraintTemplate(
      FlightRequirementRestrictionOnFlightsConstraint,
      'FLIGHT_REQUIREMENT_RESTRICTION_ON_FLIGHTS',
      'Flight Requirement Restriction on Flights',
      true,
      'Every flight should fit in its related flight requirement.'
    ),

    AIRPORT_SEQUENCE_RESTRICTION_ON_FLIGHTS: new ConstraintTemplate(
      AirportSequenceRestrictionOnFlightsConstraint,
      'AIRPORT_SEQUENCE_RESTRICTION_ON_FLIGHTS',
      'Airport Sequence Restriction on Flights',
      true,
      'Every flight should take off exactly from the same airport as its previous flight lands.'
    ),

    NO_CONFLICTION_IN_FLIGHTS: new ConstraintTemplate(
      NoConflictionOnFlightsConstraint,
      'NO_CONFLICTION_IN_FLIGHTS',
      'No Confliction in Flights',
      true,
      'No aircraft can be assigned to more than one flight at any moment.'
    ),

    MINIMUM_GROUND_TIME_BETWEEN_FLIGHTS: new ConstraintTemplate(
      MinimumGroundTimeBetweenFlightsConstraint,
      'MINIMUM_GROUND_TIME_BETWEEN_FLIGHTS',
      'Minimum Ground Time between Flights',
      true,
      'Every aircraft should erst for at least its minimum grount time before any of its flights.'
    ),

    VALID_PERIOD_CHECK_ON_AIRCRAFTS: new ConstraintTemplate(
      ValidPeriodCheckOnAircraftsConstraint,
      'VALID_PERIOD_CHECK_ON_AIRCRAFTS',
      'Valid Period Check on Aircrafts',
      true,
      'No aircraft may be out of its valid period during the pre plan date interval.'
    )
  };
}
