import Daytime from '@core/types/Daytime';
import { Stc, Airport } from 'src/business/master-data';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import FlightRequirementLeg from 'src/business/flight-requirement/FlightRequirementLeg';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import DayFlightRequirementLeg from 'src/business/flight-requirement/DayFlightRequirementLeg';
import PreplanAircraftRegister from 'src/business/preplan/PreplanAircraftRegister';
import Rsx from '@core/types/Rsx';
import Flight from 'src/business/flight/Flight';
import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import FlightLegModel from '@core/models/flight/FlightLegModel';
import Weekday from '@core/types/Weekday';
import Objectionable from 'src/business/constraints/Objectionable';
import Checker from 'src/business/constraints/Checker';
import FlightNumber from '@core/types/FlightNumber';
import Id from '@core/types/Id';
import ModelConvertable from 'src/business/ModelConvertable';
import { dataTypes } from 'src/utils/DataType';

export default class FlightLeg implements ModelConvertable<FlightLegModel>, Objectionable {
  // Original:
  readonly std: Daytime;

  // Duplicates:
  readonly label: string;
  readonly category: string;
  readonly stc: Stc;
  readonly aircraftRegister?: PreplanAircraftRegister;
  readonly rsx: Rsx;
  readonly ignored: boolean;
  readonly day: Weekday;
  readonly notes: string;
  readonly index: number;
  readonly flightNumber: FlightNumber;
  readonly departureAirport: Airport;
  readonly arrivalAirport: Airport;
  readonly blockTime: Daytime;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;

  // References:
  readonly flight: Flight;
  readonly flightRequirement: FlightRequirement;
  readonly flightRequirementLeg: FlightRequirementLeg;
  readonly dayFlightRequirement: DayFlightRequirement;
  readonly dayFlightRequirementLeg: DayFlightRequirementLeg;

  // Computational:
  readonly derivedId: Id;
  readonly sta: Daytime;
  readonly transit: boolean;
  readonly international: boolean;
  readonly dayOffset: number;
  readonly actualStd: Daytime;
  readonly actualSta: Daytime;
  readonly weekStd: number;
  readonly weekSta: number;

  // Inherited:
  readonly objectionStatusDependencies: readonly Objectionable[];

  constructor(raw: FlightLegModel, dayOffset: number, flight: Flight, dayFlightRequirementLeg: DayFlightRequirementLeg) {
    this.std = dataTypes.daytime.convertModelToBusiness(raw.std);

    this.label = flight.label;
    this.category = flight.category;
    this.stc = flight.stc;
    this.aircraftRegister = flight.aircraftRegister;
    this.rsx = flight.rsx;
    this.ignored = flight.ignored;
    this.day = flight.day;
    this.notes = flight.notes;
    this.index = dayFlightRequirementLeg.index;
    this.flightNumber = dayFlightRequirementLeg.flightRequirementLeg.flightNumber;
    this.departureAirport = dayFlightRequirementLeg.flightRequirementLeg.departureAirport;
    this.arrivalAirport = dayFlightRequirementLeg.flightRequirementLeg.arrivalAirport;
    this.blockTime = dayFlightRequirementLeg.blockTime;
    this.originPermission = dayFlightRequirementLeg.originPermission;
    this.destinationPermission = dayFlightRequirementLeg.destinationPermission;

    this.flight = flight;
    this.flightRequirement = dayFlightRequirementLeg.flightRequirement;
    this.flightRequirementLeg = dayFlightRequirementLeg.flightRequirementLeg;
    this.dayFlightRequirement = dayFlightRequirementLeg.dayFlightRequirement;
    this.dayFlightRequirementLeg = dayFlightRequirementLeg;

    this.derivedId = `${flight.id}#${this.index}`;
    this.sta = new Daytime(this.std.minutes + this.blockTime.minutes);
    this.transit = this.index > 0; //TODO: Ask Saleh.
    this.international = this.departureAirport.international || this.arrivalAirport.international;
    this.dayOffset = dayOffset;
    this.actualStd = new Daytime(this.std.minutes + this.dayOffset * 24 * 60);
    let actualStaMinutes = this.sta.minutes + this.dayOffset * 24 * 60;
    while (actualStaMinutes < this.actualStd.minutes) {
      actualStaMinutes += 24 * 60;
    }
    this.actualSta = new Daytime(actualStaMinutes);
    this.weekStd = this.day * 24 * 60 + this.actualStd.minutes;
    this.weekSta = this.day * 24 * 60 + this.actualSta.minutes;

    this.objectionStatusDependencies = [this.flightRequirement, this.dayFlightRequirement];
  }

  extractModel(override?: (flightLegModel: FlightLegModel) => FlightLegModel): FlightLegModel {
    const flightLegModel: FlightLegModel = {
      std: dataTypes.daytime.convertBusinessToModel(this.std)
    };
    return override?.(flightLegModel) ?? flightLegModel;
  }

  get marker(): string {
    return `flight ${this.label} number ${this.flightNumber} from ${this.departureAirport.name} to ${this.arrivalAirport.name} on ${Weekday[this.day]}s`;
  }
  issueObjection(type: ObjectionType, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string): Objection<FlightLeg> {
    return new Objection<FlightLeg>(type, this, 1, priority, checker, messageProvider);
  }

  stdDateTime(weekStartDate: Date): Date {
    return new Date(weekStartDate.getTime() + this.weekStd * 60 * 1000);
  }
  staDateTime(weekStartDate: Date): Date {
    return new Date(weekStartDate.getTime() + this.weekSta * 60 * 1000);
  }

  getRequiredMinimumGroundTime(startDate: Date, endDate?: Date, method: 'MAXIMUM' | 'MINIMUM' = 'MAXIMUM'): number {
    if (!this.aircraftRegister) return 0;
    return this.aircraftRegister.getMinimumGroundTime(this.transit, this.international, startDate, endDate, method);
  }
}
