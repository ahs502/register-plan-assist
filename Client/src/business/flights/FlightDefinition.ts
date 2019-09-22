import MasterData, { Stc, Airport } from '@core/master-data';
import FlightDefinitionModel from '@core/models/flights/FlightDefinitionModel';
import ModelConvertable, { getOverrided } from 'src/business/ModelConvertable';
import DeepWritablePartial from '@core/types/DeepWritablePartial';

export default class FlightDefinition implements ModelConvertable<FlightDefinitionModel> {
  readonly label: string;
  readonly category: string;
  readonly stc: Stc;
  readonly flightNumber: string;
  readonly departureAirport: Airport;
  readonly arrivalAirport: Airport;

  constructor(raw: FlightDefinitionModel) {
    this.label = raw.label;
    this.category = raw.category;
    this.stc = MasterData.all.stcs.id[raw.stcId];
    this.flightNumber = raw.flightNumber;
    this.departureAirport = MasterData.all.airports.id[raw.departureAirportId];
    this.arrivalAirport = MasterData.all.airports.id[raw.arrivalAirportId];
  }

  extractModel(overrides?: DeepWritablePartial<FlightDefinitionModel>): FlightDefinitionModel {
    return {
      label: getOverrided(this.label, overrides, 'label'),
      category: getOverrided(this.category, overrides, 'category'),
      stcId: getOverrided(this.stc.id, overrides, 'stcId'),
      flightNumber: getOverrided(this.flightNumber, overrides, 'flightNumber'),
      departureAirportId: getOverrided(this.departureAirport.id, overrides, 'departureAirportId'),
      arrivalAirportId: getOverrided(this.arrivalAirport.id, overrides, 'arrivalAirportId')
    };
  }
}
