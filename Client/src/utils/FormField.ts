import MasterData, { MasterDataItem, AircraftType, Airport } from '@core/master-data';
import Id from '@core/types/Id';
import Daytime from '@core/types/Daytime';
import FlightNumber from '@core/types/FlightNumber';

export default abstract class FormField<BusinessModelValue = any, ModelValue = BusinessModelValue> {
  check(viewValue: string): boolean {
    return true;
  }
  refine(viewValue: string): string {
    return viewValue;
  }
  parse(viewValue: string): ModelValue {
    return this.refine(viewValue) as any;
  }
  format(modelValue: BusinessModelValue): string {
    return modelValue as any;
  }
}

class NameFormField extends FormField<string> {
  refine(viewValue: string): string {
    return viewValue.trim();
  }
}

class LabelFormField extends FormField<string> {
  refine(viewValue: string): string {
    return viewValue.trim().toUpperCase();
  }
}

class UtcDateFormField extends FormField<Date, string> {
  check(viewValue: string): boolean {
    const utcDate = Date.parseUtc(viewValue);
    return utcDate.isValid();
  }
  refine(viewValue: string): string {
    const utcDate = Date.parseUtc(viewValue);
    return utcDate.isValid() ? utcDate.format('d') : viewValue;
  }
  parse(viewValue: string): string {
    const utcDate = Date.parseUtc(viewValue);
    return utcDate.toJSON();
  }
  format(modelValue: Date): string {
    const utcDate = new Date(modelValue);
    return utcDate.format('d');
  }
}

class DaytimeFormField extends FormField<Daytime | number, number> {
  check(viewValue: string): boolean {
    const daytime = new Daytime(viewValue);
    return daytime.isValid();
  }
  refine(viewValue: string): string {
    const daytime = new Daytime(viewValue);
    return daytime.isValid() ? daytime.toString('HHmm') : viewValue;
  }
  parse(viewValue: string): number {
    const daytime = new Daytime(viewValue);
    return daytime.minutes;
  }
  format(modelValue: Daytime | number): string {
    const daytime = new Daytime(modelValue);
    return daytime.toString('HHmm');
  }
}

class FlightNumberFormField extends FormField<FlightNumber, string> {
  check(viewValue: string): boolean {
    const flightNumber = new FlightNumber(viewValue);
    return flightNumber.isValid;
  }
  refine(viewValue: string): string {
    const flightNumber = new FlightNumber(viewValue);
    return flightNumber.isValid ? flightNumber.standardFormat : viewValue;
  }
  parse(viewValue: string): string {
    const flightNumber = new FlightNumber(viewValue);
    return flightNumber.standardFormat;
  }
  format(modelValue: FlightNumber): string {
    const flightNumber = modelValue;
    return flightNumber.standardFormat;
  }
}

class MasterDataFormField<Item extends MasterDataItem> extends FormField<Item, Id> {
  constructor(private masterDataItemsKey: keyof MasterData) {
    super();
  }

  check(viewValue: string): boolean {
    const item = MasterData.all[this.masterDataItemsKey].name[viewValue.toUpperCase()];
    return !!item;
  }
  refine(viewValue: string): string {
    const item = MasterData.all[this.masterDataItemsKey].name[viewValue.toUpperCase()];
    return item ? item.name : viewValue;
  }
  parse(viewValue: string): Id {
    const item = MasterData.all[this.masterDataItemsKey].name[viewValue.toUpperCase()];
    return item.id;
  }
  format(modelValue: Item): string {
    const item = modelValue;
    return item.name;
  }
}

class AircraftTypeFormField extends MasterDataFormField<AircraftType> {
  constructor() {
    super('aircraftTypes');
  }
}
class AirportFormField extends MasterDataFormField<Airport> {
  constructor() {
    super('airports');
  }
}

export const formFields = <const>{
  name: new NameFormField(),
  label: new LabelFormField(),
  utcDate: new UtcDateFormField(),
  daytime: new DaytimeFormField(),
  flightNumber: new FlightNumberFormField(),

  // Master data input fields:
  aircraftType: new AircraftTypeFormField(),
  airport: new AirportFormField()
};
