import ConstraintModel, {
  LemaBizuConstraintDataModel,
  HanaConstraintDataModel,
  KanjuConstraintDataModel,
  BartokConstraintDataModel,
  AlisoConstraintDataModel
} from '@core/models/master-data/ConstraintModel';
import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import ConstraintTemplateType from '@core/types/ConstraintTemplateType';
import AircraftRegister, { AircraftRegisters } from './AircraftRegister';
import Airport, { Airports } from './Airport';
import AircraftSelection from './AircraftSelection';
import AircraftIdentity from './AircraftIdentity';
import { AircraftTypes } from './AircraftType';
import { AircraftGroups } from './AircraftGroup';
import SeasonType, { SeasonTypes } from './SeasonType';
import Weekday from '@core/types/Weekday';

export default class Constraint extends MasterDataItem {
  readonly description: string;
  readonly type: ConstraintTemplateType;
  readonly data: LemaBizuConstraintData | HanaConstraintData | KanjuConstraintData | BartokConstraintData | AlisoConstraintData;
  readonly details: string;
  readonly fromDate?: Date;
  readonly toDate?: Date;
  readonly seasonType?: SeasonType;
  readonly days: readonly boolean[];

  constructor(
    raw: ConstraintModel,
    airports: Airports,
    aircraftRegisters: AircraftRegisters,
    aircraftTypes: AircraftTypes,
    aircraftGroups: AircraftGroups,
    seasonTypes: SeasonTypes
  ) {
    super(raw);
    this.type = raw.type;
    this.details = raw.details;
    this.fromDate = raw.fromDate ? new Date(raw.fromDate) : undefined;
    this.toDate = raw.toDate ? new Date(raw.toDate) : undefined;
    this.seasonType = raw.seasonTypeId ? seasonTypes.id[raw.seasonTypeId] : undefined;
    this.days = raw.days;

    switch (raw.type) {
      case 'LemaBizu':
        {
          const data = (this.data = convertLemaBizuConstraintDataFromModel(raw.data as LemaBizuConstraintDataModel, airports, aircraftRegisters, aircraftTypes, aircraftGroups));
          this.description = `When planning the flights of airport${getPluralS(data.airports)} ${convertNameArrayToString(data.airports.map(a => a.name))}, ${
            data.never ? 'never' : 'only'
          } use ${convertAircraftIdentityArrayToString(data.aircraftSelection.allowedIdentities)}${convertAircraftIdentityArrayToString(
            data.aircraftSelection.forbiddenIdentities,
            ' except for '
          )}.${extractDateFilter()}`;
        }
        break;

      case 'Hana':
        {
          const data = (this.data = convertHanaConstraintDataFromModel(raw.data as HanaConstraintDataModel, aircraftRegisters, aircraftTypes, aircraftGroups));
          this.description = `When planning flights longer than ${data.maximumBlockTime} minutes, never use ${convertAircraftIdentityArrayToString(
            data.aircraftSelection.allowedIdentities
          )}${convertAircraftIdentityArrayToString(data.aircraftSelection.forbiddenIdentities, ' except for ')}.${extractDateFilter()}`;
        }
        break;

      case 'Kanju':
        {
          const data = (this.data = convertKanjuConstraintDataFromModel(raw.data as KanjuConstraintDataModel, airports));
          this.description = `Never plan the flights of airport ${data.airport.name} right after the flights of airport ${data.nextAirport.name}.${extractDateFilter()}`;
        }
        break;

      case 'Bartok':
        {
          const data = (this.data = convertBartokConstraintDataFromModel(raw.data as BartokConstraintDataModel, airports, aircraftRegisters));
          this.description = `Never assign the aircraft register ${data.aircraftRegister.name} to the flights of any airport, except for ${
            data.airport.name
          }.${extractDateFilter()}`;
        }
        break;

      case 'Aliso':
        {
          const data = (this.data = convertAlisoConstraintDataFromModel(raw.data as AlisoConstraintDataModel, airports, aircraftRegisters));
          this.description = `Assign the aircraft register${getPluralS(data.aircraftRegisters)} ${convertNameArrayToString(
            data.aircraftRegisters.map(r => r.name)
          )} to the flights of airport${getPluralS(data.airports)} ${convertNameArrayToString(
            data.airports.map(a => a.name)
          )}, prioritized by order, as much as possible.${extractDateFilter()}`;
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
    function extractDateFilter(): string {
      let result = '';
      if (raw.fromDate) {
        result += ' from ' + new Date(raw.fromDate).format('d');
      }
      if (raw.toDate) {
        result += ' to ' + new Date(raw.toDate).format('d');
      }
      if (raw.seasonTypeId) {
        result += ' in ' + seasonTypes.id[raw.seasonTypeId].name + ' seasons';
      }
      if (!raw.days.every(Boolean)) {
        result += ' on ' + convertNameArrayToString(raw.days.map((d, i) => (d ? Weekday[i] + 's' : '')).filter(Boolean));
      }
      if (!result) return '';
      return ' (' + result.trim() + ')';
    }
  }
}

export interface LemaBizuConstraintData {
  readonly airports: readonly Airport[];
  readonly never: boolean;
  readonly aircraftSelection: AircraftSelection;
}
function convertLemaBizuConstraintDataFromModel(
  data: LemaBizuConstraintDataModel,
  airports: Airports,
  aircraftRegisters: AircraftRegisters,
  aircraftTypes: AircraftTypes,
  aircraftGroups: AircraftGroups
): LemaBizuConstraintData {
  return {
    airports: data.airportIds.map(id => airports.id[id]),
    never: data.never,
    aircraftSelection: new AircraftSelection(data.aircraftSelection, aircraftRegisters, aircraftTypes, aircraftGroups)
  };
}

export interface HanaConstraintData {
  readonly maximumBlockTime: number;
  readonly aircraftSelection: AircraftSelection;
}
function convertHanaConstraintDataFromModel(
  data: HanaConstraintDataModel,
  aircraftRegisters: AircraftRegisters,
  aircraftTypes: AircraftTypes,
  aircraftGroups: AircraftGroups
): HanaConstraintData {
  return {
    maximumBlockTime: data.maximumBlockTime,
    aircraftSelection: new AircraftSelection(data.aircraftSelection, aircraftRegisters, aircraftTypes, aircraftGroups)
  };
}

export interface KanjuConstraintData {
  readonly airport: Airport;
  readonly nextAirport: Airport;
}
function convertKanjuConstraintDataFromModel(data: KanjuConstraintDataModel, airports: Airports): KanjuConstraintData {
  return {
    airport: airports.id[data.airportId],
    nextAirport: airports.id[data.nextAirportId]
  };
}

export interface BartokConstraintData {
  readonly aircraftRegister: AircraftRegister;
  readonly airport: Airport;
}
function convertBartokConstraintDataFromModel(data: BartokConstraintDataModel, airports: Airports, aircraftRegisters: AircraftRegisters): BartokConstraintData {
  return {
    aircraftRegister: aircraftRegisters.id[data.aircraftRegisterId],
    airport: airports.id[data.airportId]
  };
}

export interface AlisoConstraintData {
  readonly aircraftRegisters: readonly AircraftRegister[];
  readonly airports: readonly Airport[];
}
function convertAlisoConstraintDataFromModel(data: AlisoConstraintDataModel, airports: Airports, aircraftRegisters: AircraftRegisters): AlisoConstraintData {
  return {
    aircraftRegisters: data.aircraftRegisterIds.map(id => aircraftRegisters.id[id]),
    airports: data.airportIds.map(id => airports.id[id])
  };
}

export class Constraints extends MasterDataItems<Constraint> {
  static parse(
    airports: Airports,
    aircraftRegisters: AircraftRegisters,
    aircraftTypes: AircraftTypes,
    aircraftGroups: AircraftGroups,
    seasonTypes: SeasonTypes,
    raw?: readonly ConstraintModel[]
  ): Constraints | undefined {
    if (!raw) return undefined;
    return new Constraints(raw.map(x => new Constraint(x, airports, aircraftRegisters, aircraftTypes, aircraftGroups, seasonTypes)));
  }
}
