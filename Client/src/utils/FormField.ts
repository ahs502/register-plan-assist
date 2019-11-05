import MasterData, { Airport } from '@core/master-data';
import Id from '@core/types/Id';
import Daytime from '@core/types/Daytime';
import FlightNumber from '@core/types/FlightNumber';

export default abstract class FormField<BusinessModelValue = any, ModelValue = BusinessModelValue> {
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

class AirportFormField extends FormField<Airport, Id> {
  refine(viewValue: string): string {
    const airport = MasterData.all.airports.name[viewValue.toUpperCase()];
    return airport ? airport.name : viewValue;
  }
  parse(viewValue: string): Id {
    const airport = MasterData.all.airports.name[viewValue];
    return airport.id;
  }
  format(modelValue: Airport): string {
    const airport = modelValue;
    return airport.name;
  }
}

export const formFields = <const>{
  name: new NameFormField(),
  label: new LabelFormField(),
  utcDate: new UtcDateFormField(),
  daytime: new DaytimeFormField(),
  flightNumber: new FlightNumberFormField(),
  airport: new AirportFormField()
};
