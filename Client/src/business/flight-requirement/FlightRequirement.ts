import ModelConvertable, { getOverridedObject, getOverrided, getOverridedArray } from 'src/business/ModelConvertable';
import FlightRequirementModel from '@core/models/flight-requirement/FlightRequirementModel';
import Id from '@core/types/Id';
import MasterData, { Stc } from '@core/master-data';
import Rsx from '@core/types/Rsx';
import FlightRequirementLeg from './FlightRequirementLeg';
import DayFlightRequirement from './DayFlightRequirement';
import PreplanAircraftSelection from 'src/business/preplan/PreplanAircraftSelection';
import { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import DeepWritablePartial from '@core/types/DeepWritablePartial';
import Objectionable from 'src/business/constraints/Objectionable';
import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import Checker from 'src/business/constraints/Checker';

export default class FlightRequirement implements ModelConvertable<FlightRequirementModel>, Objectionable {
  readonly id: Id;
  readonly label: string;
  readonly category: string;
  readonly stc: Stc;
  readonly aircraftSelection: PreplanAircraftSelection;
  readonly rsx: Rsx;
  readonly ignored: boolean;
  readonly route: readonly FlightRequirementLeg[];
  readonly days: readonly DayFlightRequirement[];

  readonly objectionStatusDependencies: readonly Objectionable[];

  constructor(raw: FlightRequirementModel, aircraftRegisters: PreplanAircraftRegisters) {
    this.id = raw.id;
    this.label = raw.label;
    this.category = raw.category;
    this.stc = MasterData.all.stcs.id[raw.stcId];
    this.aircraftSelection = new PreplanAircraftSelection(raw.aircraftSelection, aircraftRegisters);
    this.rsx = raw.rsx;
    this.ignored = raw.ignored;
    this.route = raw.route.map((l, index) => new FlightRequirementLeg(l, index, this));
    this.days = raw.days.map(d => new DayFlightRequirement(d, aircraftRegisters, this));

    this.objectionStatusDependencies = this.days;
  }

  extractModel(overrides?: DeepWritablePartial<FlightRequirementModel>): FlightRequirementModel {
    return {
      id: getOverrided(this.id, overrides, 'id'),
      label: getOverrided(this.label, overrides, 'label'),
      category: getOverrided(this.category, overrides, 'category'),
      stcId: getOverrided(this.stc.id, overrides, 'stcId'),
      aircraftSelection: getOverridedObject(this.aircraftSelection, overrides, 'aircraftSelection'),
      rsx: getOverrided(this.rsx, overrides, 'rsx'),
      ignored: getOverrided(this.ignored, overrides, 'ignored'),
      route: getOverridedArray(this.route, overrides, 'route'),
      days: getOverridedArray(this.days, overrides, 'days')
    };
  }

  get marker(): string {
    return `flight requirement ${this.label}`;
  }
  issueObjection(type: ObjectionType, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string): Objection<FlightRequirement> {
    return new Objection<FlightRequirement>(type, this, 2, priority, checker, messageProvider);
  }
}
