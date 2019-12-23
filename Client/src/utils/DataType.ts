import MasterData, {
  MasterDataItem,
  AircraftType,
  AircraftRegister,
  Airport,
  SeasonType,
  Season,
  Stc,
  AircraftRegisterGroup,
  ConstraintTemplate,
  Constraint
} from '@core/master-data';
import Id from '@core/types/Id';
import Daytime from '@core/types/Daytime';
import FlightNumber from '@core/types/FlightNumber';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';

export default abstract class DataType<Model, Business> {
  /**
   * Returns true iff the `value` is valid.
   */
  checkView(value: string): boolean {
    return true;
  }

  /**
   * Returns a refined `value` iff the given `value` is valid.
   * And, returns the same given `value` otherwise.
   */
  refineView(value: string): string {
    return value;
  }

  /**
   * Assuming the view value is valid.
   */
  convertViewToModel(value: string): Model {
    if (!this.checkView(value)) throw 'Invalid view value.';
    return this.refineView(value) as any;
  }
  convertModelToBusiness(value: Model): Business {
    return value as any;
  }
  convertBusinessToView(value: Business): string {
    return value as any;
  }

  // Short hands:

  convertModelToView(value: Model): string {
    return this.convertBusinessToView(this.convertModelToBusiness(value));
  }
  convertBusinessToModel(value: Business): Model {
    return this.convertViewToModel(this.convertBusinessToView(value));
  }
  convertViewToBusiness(value: string): Business {
    return this.convertModelToBusiness(this.convertViewToModel(value));
  }

  // Optional data:

  convertViewToModelOptional(value: string | ''): Model | undefined {
    return !value ? undefined : this.convertViewToModel(value);
  }
  convertModelToBusinessOptional(value: Model | undefined): Business | undefined {
    return !value ? undefined : this.convertModelToBusiness(value);
  }
  convertBusinessToViewOptional(value: Business | undefined): string | '' {
    return !value ? '' : this.convertBusinessToView(value);
  }

  // Short hands for optional data:

  convertModelToViewOptional(value: Model | undefined): string | '' {
    return !value ? '' : this.convertModelToView(value);
  }
  convertBusinessToModelOptional(value: Business | undefined): Model | undefined {
    return !value ? undefined : this.convertBusinessToModel(value);
  }
  convertViewToBusinessOptional(value: string | ''): Business | undefined {
    return !value ? undefined : this.convertViewToBusiness(value);
  }
}

class NameDataType extends DataType<string, string> {
  refineView(value: string): string {
    return value.trim();
  }
}

class LabelDataType extends DataType<string, string> {
  refineView(value: string): string {
    return value.trim().toUpperCase();
  }
}

class UtcDateDataType extends DataType<string, Date> {
  checkView(value: string): boolean {
    const utcDate = Date.parseUtc(value);
    return utcDate.isValid();
  }
  refineView(value: string): string {
    const utcDate = Date.parseUtc(value);
    return utcDate.isValid() ? utcDate.format('d') : value;
  }
  convertViewToModel(value: string): string {
    const utcDate = Date.parseUtc(value);
    if (!utcDate.isValid()) throw 'Invalid utc date view value.';
    return utcDate.toJSON();
  }
  convertModelToBusiness(value: string): Date {
    const utcDate = new Date(value);
    return utcDate;
  }
  convertBusinessToView(value: Date): string {
    const utcDate = new Date(value);
    return utcDate.format('d');
  }
}

class DaytimeDataType extends DataType<number, Daytime> {
  checkView(value: string): boolean {
    const daytime = new Daytime(value);
    return daytime.isValid();
  }
  refineView(value: string): string {
    const daytime = new Daytime(value);
    return daytime.isValid() ? daytime.toString('HHmm') : value;
  }
  convertViewToModel(value: string): number {
    const daytime = new Daytime(value);
    if (!daytime.isValid) throw 'Invalid daytime view value.';
    return daytime.minutes;
  }
  convertModelToBusiness(value: number): Daytime {
    const daytime = new Daytime(value);
    return daytime;
  }
  convertBusinessToView(value: Daytime): string {
    const daytime = new Daytime(value);
    return daytime.toString('HHmm');
  }
}

class FlightNumberDataType extends DataType<string, FlightNumber> {
  checkView(value: string): boolean {
    const flightNumber = new FlightNumber(value);
    return flightNumber.isValid;
  }
  refineView(value: string): string {
    const flightNumber = new FlightNumber(value);
    return flightNumber.isValid ? flightNumber.standardFormat : value;
  }
  convertViewToModel(value: string): string {
    const flightNumber = new FlightNumber(value);
    if (!flightNumber.isValid) throw 'Invalid flight number view value.';
    return flightNumber.standardFormat;
  }
  convertModelToBusiness(value: string): FlightNumber {
    const flightNumber = new FlightNumber(value);
    return flightNumber;
  }
  convertBusinessToView(value: FlightNumber): string {
    const flightNumber = value;
    return flightNumber.standardFormat;
  }
}

class MasterDataDataType<Item extends MasterDataItem> extends DataType<Id, Item> {
  constructor(private masterDataItemsKey: keyof MasterData) {
    super();
  }

  checkView(value: string): boolean {
    const item = MasterData.all[this.masterDataItemsKey].name[value.trim().toUpperCase()];
    return !!item;
  }
  refineView(value: string): string {
    const item = MasterData.all[this.masterDataItemsKey].name[value.trim().toUpperCase()];
    return item ? item.name : value;
  }
  convertViewToModel(value: string): Id {
    const item = MasterData.all[this.masterDataItemsKey].name[value.trim().toUpperCase()];
    if (!item) throw 'Invalid master data view value.';
    return item.id;
  }
  convertModelToBusiness(value: Id): Item {
    const item = MasterData.all[this.masterDataItemsKey].id[value];
    return item as Item;
  }
  convertBusinessToView(value: Item): string {
    const item = value;
    return item.name;
  }
}

class AircraftTypeDataType extends MasterDataDataType<AircraftType> {
  constructor() {
    super('aircraftTypes');
  }
}
class AircraftRegisterDataType extends MasterDataDataType<AircraftRegister> {
  constructor() {
    super('aircraftRegisters');
  }
}
class AirportDataType extends MasterDataDataType<Airport> {
  constructor() {
    super('airports');
  }
}
class SeasonTypeDataType extends MasterDataDataType<SeasonType> {
  constructor() {
    super('seasonTypes');
  }
}
class SeasonDataType extends MasterDataDataType<Season> {
  constructor() {
    super('seasons');
  }
}
class StcDataType extends MasterDataDataType<Stc> {
  constructor() {
    super('stcs');
  }
}
class AircraftRegisterGroupDataType extends MasterDataDataType<AircraftRegisterGroup> {
  constructor() {
    super('aircraftRegisterGroups');
  }
}
class ConstraintTemplateDataType extends MasterDataDataType<ConstraintTemplate> {
  constructor() {
    super('constraintTemplates');
  }
}
class ConstraintDataType extends MasterDataDataType<Constraint> {
  constructor() {
    super('constraints');
  }
}

class PreplanAircraftRegisterDataType extends DataType<Id, PreplanAircraftRegister> {
  constructor(private aircraftRegisters: PreplanAircraftRegisters) {
    super();
  }

  checkView(value: string): boolean {
    const item = this.aircraftRegisters.name[value.trim().toUpperCase()];
    return !!item && item.options.status !== 'IGNORED';
  }
  refineView(value: string): string {
    const item = this.aircraftRegisters.name[value.trim().toUpperCase()];
    return item && item.options.status !== 'IGNORED' ? item.name : value;
  }
  convertViewToModel(value: string): Id {
    const item = this.aircraftRegisters.name[value.trim().toUpperCase()];
    if (!item || item.options.status === 'IGNORED') throw 'Invalid preplan aircraft register view value.';
    return item.id;
  }
  convertModelToBusiness(value: Id): PreplanAircraftRegister {
    const item = this.aircraftRegisters.id[value];
    return item;
  }
  convertBusinessToView(value: PreplanAircraftRegister): string {
    const item = value;
    return item.name;
  }
}

export const dataTypes = <const>{
  name: new NameDataType(),
  label: new LabelDataType(),
  utcDate: new UtcDateDataType(),
  daytime: new DaytimeDataType(),
  flightNumber: new FlightNumberDataType(),

  // Master data input fields:
  aircraftType: new AircraftTypeDataType(),
  aircraftRegister: new AircraftRegisterDataType(),
  airport: new AirportDataType(),
  seasonType: new SeasonTypeDataType(),
  season: new SeasonDataType(),
  stc: new StcDataType(),
  aircraftRegisterGroup: new AircraftRegisterGroupDataType(),
  constraintTemplate: new ConstraintTemplateDataType(),
  constraint: new ConstraintDataType(),

  preplanAircraftRegister(aircraftRegisters: PreplanAircraftRegisters): PreplanAircraftRegisterDataType {
    return new PreplanAircraftRegisterDataType(aircraftRegisters);
  }
};
