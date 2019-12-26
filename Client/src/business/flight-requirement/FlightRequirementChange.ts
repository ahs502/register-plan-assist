import Rsx from '@core/types/Rsx';
import PreplanAircraftSelection from 'src/business/preplan/PreplanAircraftSelection';
import { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import ModelConvertable from 'src/business/ModelConvertable';
import { dataTypes } from 'src/utils/DataType';
import FlightRequirementChangeModel from '@core/models/flight-requirement/FlightRequirementChangeModel';
import FlightRequirementLegChange from 'src/business/flight-requirement/FlightRequirementLegChange';
import DayFlightRequirementChange from 'src/business/flight-requirement/DayFlightRequirementChange';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';

export default class FlightRequirementChange implements ModelConvertable<FlightRequirementChangeModel> {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly aircraftSelection: PreplanAircraftSelection;
  readonly rsx: Rsx;
  readonly notes: string;
  readonly route: readonly FlightRequirementLegChange[];
  readonly days: readonly DayFlightRequirementChange[];

  constructor(raw: FlightRequirementChangeModel, aircraftRegisters: PreplanAircraftRegisters, readonly flightRequirement: FlightRequirement) {
    this.startDate = dataTypes.utcDate.convertModelToBusiness(raw.startDate);
    this.endDate = dataTypes.utcDate.convertModelToBusiness(raw.endDate);
    this.aircraftSelection = new PreplanAircraftSelection(raw.aircraftSelection, aircraftRegisters);
    this.rsx = raw.rsx;
    this.notes = dataTypes.label.convertModelToBusiness(raw.notes);
    this.route = raw.route.map((l, index) => new FlightRequirementLegChange(l, index, flightRequirement, this, flightRequirement.route[index]));
    this.days = raw.days.map((d, index) => new DayFlightRequirementChange(d, aircraftRegisters, flightRequirement, this, flightRequirement.days[index]));
  }

  extractModel(override?: (flightRequirementChangeModel: FlightRequirementChangeModel) => FlightRequirementChangeModel): FlightRequirementChangeModel {
    const flightRequirementChangeModel: FlightRequirementChangeModel = {
      startDate: dataTypes.utcDate.convertBusinessToModel(this.startDate),
      endDate: dataTypes.utcDate.convertBusinessToModel(this.endDate),
      aircraftSelection: this.aircraftSelection.extractModel(),
      rsx: this.rsx,
      notes: dataTypes.label.convertBusinessToModel(this.notes),
      route: this.route.map(l => l.extractModel()),
      days: this.days.map(d => d.extractModel())
    };
    return override?.(flightRequirementChangeModel) ?? flightRequirementChangeModel;
  }
}
