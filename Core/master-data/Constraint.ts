import ConstraintModel, {
  AircraftRestrictionOnAirportsConstraintDataModel,
  BlockTimeRestrictionOnAircraftsConstraintDataModel,
  RouteSequenceRestrictionOnAirportsConstraintDataModel,
  AirportRestrictionOnAircraftsConstraintDataModel,
  AirportAllocationPriorityForAircraftsConstraintDataModel
} from '@core/models/master-data/ConstraintModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import ConstraintTemplate, { ConstraintTemplates } from './ConstraintTemplate';
import AircraftRegister, { AircraftRegisters } from './AircraftRegister';
import Airport, { Airports } from './Airport';
import AircraftSelection from './AircraftSelection';
import AircraftIdentity from './AircraftIdentity';
import { AircraftTypes } from './AircraftType';
import { AircraftGroups } from './AircraftGroup';
import SeasonType, { SeasonTypes } from './SeasonType';
import Weekday from '@core/types/Weekday';

export default class Constraint extends MasterDataItem {
  readonly template: ConstraintTemplate;
  readonly description: string;
  readonly details: string;
  readonly scope: {
    readonly fromDate?: Date;
    readonly toDate?: Date;
    readonly seasonType?: SeasonType;
    readonly days: readonly boolean[];
  };
  readonly data:
    | AircraftRestrictionOnAirportsConstraintData
    | AirportRestrictionOnAircraftsConstraintData
    | BlockTimeRestrictionOnAircraftsConstraintData
    | RouteSequenceRestrictionOnAirportsConstraintData
    | AirportAllocationPriorityForAircraftsConstraintData;

  constructor(
    raw: ConstraintModel,
    constraintTemplates: ConstraintTemplates,
    airports: Airports,
    aircraftRegisters: AircraftRegisters,
    aircraftTypes: AircraftTypes,
    aircraftGroups: AircraftGroups,
    seasonTypes: SeasonTypes
  ) {
    super(raw);
    this.template = constraintTemplates.items.find(t => t.type === raw.type)!;
    this.details = raw.details;
    this.scope = {
      fromDate: raw.scope.fromDate ? new Date(raw.scope.fromDate) : undefined,
      toDate: raw.scope.toDate ? new Date(raw.scope.toDate) : undefined,
      seasonType: raw.scope.seasonTypeId ? seasonTypes.id[raw.scope.seasonTypeId] : undefined,
      days: raw.scope.days
    };

    switch (raw.type) {
      case 'AIRCRAFT_RESTRICTION_ON_AIRPORTS':
        {
          const data = (this.data = convertAircraftRestrictionOnAirportsConstraintDataFromModel(
            raw.data as AircraftRestrictionOnAirportsConstraintDataModel,
            airports,
            aircraftRegisters,
            aircraftTypes,
            aircraftGroups
          ));
          this.description = `When planning the flights of airport${getPluralS(data.airports)} ${convertNameArrayToString(data.airports.map(a => a.name))}, ${
            data.never ? 'never' : 'only'
          } use ${convertAircraftIdentityArrayToString(data.aircraftSelection.allowedIdentities)}${convertAircraftIdentityArrayToString(
            data.aircraftSelection.forbiddenIdentities,
            ' except for '
          )}.${extractScope()}`;
        }
        break;

      case 'AIRPORT_RESTRICTION_ON_AIRCRAFTS':
        {
          const data = (this.data = convertAirportRestrictionOnAircraftsConstraintDataFromModel(
            raw.data as AirportRestrictionOnAircraftsConstraintDataModel,
            airports,
            aircraftRegisters
          ));
          this.description = `Never assign the aircraft register ${data.aircraftRegister.name} to the flights of any airport, except for ${data.airport.name}.${extractScope()}`;
        }
        break;

      case 'BLOCK_TIME_RESTRICTION_ON_AIRCRAFTS':
        {
          const data = (this.data = convertBlockTimeRestrictionOnAircraftsConstraintDataFromModel(
            raw.data as BlockTimeRestrictionOnAircraftsConstraintDataModel,
            aircraftRegisters,
            aircraftTypes,
            aircraftGroups
          ));
          this.description = `When planning flights longer than ${data.maximumBlockTime} minutes, never use ${convertAircraftIdentityArrayToString(
            data.aircraftSelection.allowedIdentities
          )}${convertAircraftIdentityArrayToString(data.aircraftSelection.forbiddenIdentities, ' except for ')}.${extractScope()}`;
        }
        break;

      case 'ROUTE_SEQUENCE_RESTRICTION_ON_AIRPORTS':
        {
          const data = (this.data = convertRouteSequenceRestrictionOnAirportsConstraintDataFromModel(raw.data as RouteSequenceRestrictionOnAirportsConstraintDataModel, airports));
          this.description = `Never plan the flights of airport ${data.airport.name} right after the flights of airport ${data.nextAirport.name}.${extractScope()}`;
        }
        break;

      case 'AIRPORT_ALLOCATION_PRIORITY_FOR_AIRCRAFTS':
        {
          const data = (this.data = convertAirportAllocationPriorityForAircraftsConstraintDataFromModel(
            raw.data as AirportAllocationPriorityForAircraftsConstraintDataModel,
            airports,
            aircraftRegisters
          ));
          this.description = `Assign the aircraft register${getPluralS(data.aircraftRegisters)} ${convertNameArrayToString(
            data.aircraftRegisters.map(r => r.name)
          )} to the flights of airport${getPluralS(data.airports)} ${convertNameArrayToString(
            data.airports.map(a => a.name)
          )}, prioritized by order, as much as possible.${extractScope()}`;
        }
        break;

      default:
        throw `Not supported constraint template type ${raw.type}.`;
    }

    function getPluralS(array: readonly any[]): string {
      if (array.length === 1) return '';
      return 's';
    }
    function convertNameArrayToString(names: readonly string[]): string {
      if (names.length === 0) return '';
      if (names.length === 1) return names[0];
      return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
    }
    function convertAircraftIdentityArrayToString(aircraftIdentities: readonly AircraftIdentity[], prefix?: string): string {
      if (aircraftIdentities.length === 0) return '';
      if (aircraftIdentities.length === 1) return `${prefix || ''}aircraft ${aircraftIdentities[0].entity.name}`;
      return `${prefix || ''}aircrafts ${convertNameArrayToString(aircraftIdentities.map(i => i.entity.name))}`;
    }
    function extractScope(): string {
      let result = '';
      raw.scope.fromDate && (result += ' from ' + new Date(raw.scope.fromDate).format('d'));
      raw.scope.toDate && (result += ' to ' + new Date(raw.scope.toDate).format('d'));
      raw.scope.seasonTypeId && (result += ' in ' + seasonTypes.id[raw.scope.seasonTypeId].name + ' seasons');
      raw.scope.days.every(Boolean) || (result += ' on ' + convertNameArrayToString(raw.scope.days.map((d, i) => (d ? Weekday[i] + 's' : '')).filter(Boolean)));
      if (!result) return '';
      return ' (' + result.trim() + ')';
    }
  }
}

export interface AircraftRestrictionOnAirportsConstraintData {
  readonly airports: readonly Airport[];
  readonly never: boolean;
  readonly aircraftSelection: AircraftSelection;
  readonly required: boolean;
}
function convertAircraftRestrictionOnAirportsConstraintDataFromModel(
  data: AircraftRestrictionOnAirportsConstraintDataModel,
  airports: Airports,
  aircraftRegisters: AircraftRegisters,
  aircraftTypes: AircraftTypes,
  aircraftGroups: AircraftGroups
): AircraftRestrictionOnAirportsConstraintData {
  return {
    airports: data.airportIds.map(id => airports.id[id]),
    never: data.adverb === 'NEVER',
    aircraftSelection: new AircraftSelection(data.aircraftSelection, aircraftRegisters, aircraftTypes, aircraftGroups),
    required: data.required
  };
}

export interface AirportRestrictionOnAircraftsConstraintData {
  readonly aircraftRegister: AircraftRegister;
  readonly airport: Airport;
}
function convertAirportRestrictionOnAircraftsConstraintDataFromModel(
  data: AirportRestrictionOnAircraftsConstraintDataModel,
  airports: Airports,
  aircraftRegisters: AircraftRegisters
): AirportRestrictionOnAircraftsConstraintData {
  return {
    aircraftRegister: aircraftRegisters.id[data.aircraftRegisterId],
    airport: airports.id[data.airportId]
  };
}

export interface BlockTimeRestrictionOnAircraftsConstraintData {
  readonly maximumBlockTime: number;
  readonly aircraftSelection: AircraftSelection;
}
function convertBlockTimeRestrictionOnAircraftsConstraintDataFromModel(
  data: BlockTimeRestrictionOnAircraftsConstraintDataModel,
  aircraftRegisters: AircraftRegisters,
  aircraftTypes: AircraftTypes,
  aircraftGroups: AircraftGroups
): BlockTimeRestrictionOnAircraftsConstraintData {
  return {
    maximumBlockTime: data.maximumBlockTime,
    aircraftSelection: new AircraftSelection(data.aircraftSelection, aircraftRegisters, aircraftTypes, aircraftGroups)
  };
}

export interface RouteSequenceRestrictionOnAirportsConstraintData {
  readonly airport: Airport;
  readonly nextAirport: Airport;
}
function convertRouteSequenceRestrictionOnAirportsConstraintDataFromModel(
  data: RouteSequenceRestrictionOnAirportsConstraintDataModel,
  airports: Airports
): RouteSequenceRestrictionOnAirportsConstraintData {
  return {
    airport: airports.id[data.airportId],
    nextAirport: airports.id[data.nextAirportId]
  };
}

export interface AirportAllocationPriorityForAircraftsConstraintData {
  readonly aircraftRegisters: readonly AircraftRegister[];
  readonly airports: readonly Airport[];
}
function convertAirportAllocationPriorityForAircraftsConstraintDataFromModel(
  data: AirportAllocationPriorityForAircraftsConstraintDataModel,
  airports: Airports,
  aircraftRegisters: AircraftRegisters
): AirportAllocationPriorityForAircraftsConstraintData {
  return {
    aircraftRegisters: data.aircraftRegisterIds.map(id => aircraftRegisters.id[id]),
    airports: data.airportIds.map(id => airports.id[id])
  };
}

export class Constraints extends MasterDataItems<Constraint> {
  static parse(
    constraintTemplates: ConstraintTemplates,
    airports: Airports,
    aircraftRegisters: AircraftRegisters,
    aircraftTypes: AircraftTypes,
    aircraftGroups: AircraftGroups,
    seasonTypes: SeasonTypes,
    raw?: readonly ConstraintModel[]
  ): Constraints | undefined {
    if (!raw) return undefined;
    return new Constraints(raw.map(x => new Constraint(x, constraintTemplates, airports, aircraftRegisters, aircraftTypes, aircraftGroups, seasonTypes)));
  }
}
