import FlightRequirementModel from '@core/models/flight-requirement/FlightRequirementModel';
import Id from '@core/types/Id';
import MasterData, { Stc } from '@core/master-data';
import Rsx from '@core/types/Rsx';
import FlightRequirementLeg from './FlightRequirementLeg';
import DayFlightRequirement from './DayFlightRequirement';
import PreplanAircraftSelection from 'src/business/preplan/PreplanAircraftSelection';
import { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import Objectionable from 'src/business/constraints/Objectionable';
import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import Checker from 'src/business/constraints/Checker';

export default class FlightRequirement implements Objectionable {
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

  readonly objectionStatusDependencies: readonly Objectionable[];

  constructor(raw: FlightRequirementModel, aircraftRegisters: PreplanAircraftRegisters) {
    this.id = raw.id;
    this.label = raw.label;
    this.category = raw.category;
    this.stc = MasterData.all.stcs.id[raw.stcId];
    this.aircraftSelection = new PreplanAircraftSelection(raw.aircraftSelection, aircraftRegisters);
    this.rsx = raw.rsx;
    this.notes = raw.notes;
    this.ignored = raw.ignored;
    this.route = raw.route.map((l, index) => new FlightRequirementLeg(l, index, this));
    this.days = raw.days.map(d => new DayFlightRequirement(d, aircraftRegisters, this));

    this.objectionStatusDependencies = this.days;
  }

  get marker(): string {
    return `flight requirement ${this.label}`;
  }
  issueObjection(type: ObjectionType, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string): Objection<FlightRequirement> {
    return new Objection<FlightRequirement>(type, this, 2, priority, checker, messageProvider);
  }
}
