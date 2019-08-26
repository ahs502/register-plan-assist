import FlightRequirement from './FlightRequirement';
import WeekdayFlightRequirement from './WeekdayFlightRequirement';
import { Stc, Airport } from '@core/master-data';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/view-models/PreplanAircraftRegister';
import FlightModel from '@core/models/flights/FlightModel';
import Rsx from '@core/types/flight-requirement/Rsx';

export default class Flight {
  readonly requirement: FlightRequirement;
  readonly weekdayRequirement: WeekdayFlightRequirement;
  readonly derivedId: string;
  readonly label: string;
  readonly category: string;
  readonly stc: Stc;
  readonly flightNumber: string;
  readonly departureAirport: Airport;
  readonly arrivalAirport: Airport;
  readonly notes: string;
  readonly freezed: boolean;
  readonly day: number;
  readonly blockTime: number;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;
  readonly rsx: Rsx;
  readonly required: boolean;
  readonly std: Daytime;
  readonly aircraftRegister?: PreplanAircraftRegister;

  constructor(raw: FlightModel, weekdayRequiremnet: WeekdayFlightRequirement, aircraftRegisters: PreplanAircraftRegisters) {
    this.requirement = weekdayRequiremnet.requirement;
    this.weekdayRequirement = weekdayRequiremnet;
    this.derivedId = weekdayRequiremnet.derivedId;
    this.label = weekdayRequiremnet.definition.label;
    this.category = weekdayRequiremnet.definition.category;
    this.stc = weekdayRequiremnet.definition.stc;
    this.flightNumber = weekdayRequiremnet.definition.flightNumber;
    this.departureAirport = weekdayRequiremnet.definition.departureAirport;
    this.arrivalAirport = weekdayRequiremnet.definition.arrivalAirport;
    this.notes = weekdayRequiremnet.notes;
    this.freezed = weekdayRequiremnet.freezed;
    this.day = weekdayRequiremnet.day;
    this.blockTime = weekdayRequiremnet.scope.blockTime;
    this.originPermission = weekdayRequiremnet.scope.originPermission;
    this.destinationPermission = weekdayRequiremnet.scope.destinationPermission;
    this.rsx = weekdayRequiremnet.scope.rsx;
    this.required = weekdayRequiremnet.scope.required;
    this.std = new Daytime(raw.std);
    this.aircraftRegister = raw.aircraftRegisterId ? aircraftRegisters.id[raw.aircraftRegisterId] : undefined;
  }
}
