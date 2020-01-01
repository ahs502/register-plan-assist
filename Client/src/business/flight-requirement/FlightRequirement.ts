import FlightRequirementModel from '@core/models/flight-requirement/FlightRequirementModel';
import Id from '@core/types/Id';
import { Stc } from 'src/business/master-data';
import Rsx from '@core/types/Rsx';
import FlightRequirementLeg from './FlightRequirementLeg';
import DayFlightRequirement from './DayFlightRequirement';
import PreplanAircraftSelection from 'src/business/preplan/PreplanAircraftSelection';
import { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import Objectionable from 'src/business/constraints/Objectionable';
import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import Checker from 'src/business/constraints/Checker';
import ModelConvertable from 'src/business/ModelConvertable';
import { dataTypes } from 'src/utils/DataType';
import FlightRequirementChange from 'src/business/flight-requirement/FlightRequirementChange';

export default class FlightRequirement implements ModelConvertable<FlightRequirementModel>, Objectionable {
  readonly id: Id;
  readonly label: string;
  readonly category: string;
  readonly stc: Stc;
  readonly aircraftSelection: PreplanAircraftSelection;
  readonly rsx: Rsx;
  readonly notes: string;
  readonly ignored: boolean;
  readonly route: readonly FlightRequirementLeg[];
  readonly days: readonly DayFlightRequirement[];
  readonly changes: readonly FlightRequirementChange[];

  readonly objectionStatusDependencies: readonly Objectionable[];

  constructor(raw: FlightRequirementModel, aircraftRegisters: PreplanAircraftRegisters) {
    this.id = raw.id;
    this.label = dataTypes.label.convertModelToBusiness(raw.label);
    this.category = dataTypes.name.convertModelToBusiness(raw.category);
    this.stc = dataTypes.stc.convertModelToBusiness(raw.stcId);
    this.aircraftSelection = new PreplanAircraftSelection(raw.aircraftSelection, aircraftRegisters);
    this.rsx = raw.rsx;
    this.notes = dataTypes.label.convertModelToBusiness(raw.notes);
    this.ignored = raw.ignored;
    this.route = raw.route.map((l, index) => new FlightRequirementLeg(l, index, this));
    this.days = raw.days.map(d => new DayFlightRequirement(d, aircraftRegisters, this));
    this.changes = raw.changes.map(c => new FlightRequirementChange(c, aircraftRegisters, this));

    this.objectionStatusDependencies = this.days;
  }

  extractModel(override?: (flightRequirementModel: FlightRequirementModel) => FlightRequirementModel): FlightRequirementModel {
    const flightRequirementModel: FlightRequirementModel = {
      id: this.id,
      label: dataTypes.label.convertBusinessToModel(this.label),
      category: dataTypes.name.convertBusinessToModel(this.category),
      stcId: dataTypes.stc.convertBusinessToModel(this.stc),
      aircraftSelection: this.aircraftSelection.extractModel(),
      rsx: this.rsx,
      notes: dataTypes.label.convertBusinessToModel(this.notes),
      ignored: this.ignored,
      route: this.route.map(l => l.extractModel()),
      days: this.days.map(d => d.extractModel()),
      changes: this.changes.map(c => c.extractModel())
    };
    return override?.(flightRequirementModel) ?? flightRequirementModel;
  }

  get marker(): string {
    return `flight requirement ${this.label}`;
  }
  issueObjection(type: ObjectionType, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string): Objection<FlightRequirement> {
    return new Objection<FlightRequirement>(type, this, 2, priority, checker, messageProvider);
  }
}
