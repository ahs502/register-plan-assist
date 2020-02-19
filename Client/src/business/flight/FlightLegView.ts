import Daytime from '@core/types/Daytime';
import { Stc, Airport } from 'src/business/master-data';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import FlightRequirementLeg from 'src/business/flight-requirement/FlightRequirementLeg';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import DayFlightRequirementLeg from 'src/business/flight-requirement/DayFlightRequirementLeg';
import PreplanAircraftRegister from 'src/business/preplan/PreplanAircraftRegister';
import Rsx from '@core/types/Rsx';
import Flight from 'src/business/flight/Flight';
import Weekday from '@core/types/Weekday';
import FlightNumber from '@core/types/FlightNumber';
import Id from '@core/types/Id';
import FlightView from 'src/business/flight/FlightView';
import FlightLeg from 'src/business/flight/FlightLeg';
import Week from 'src/business/Week';

export default class FlightLegView {
  // Original:
  readonly std: Daytime;

  // References:
  readonly flightView: FlightView;
  readonly flightRequirement: FlightRequirement;
  readonly flightRequirementLeg: FlightRequirementLeg;
  readonly dayFlightRequirement: DayFlightRequirement;
  readonly dayFlightRequirementLeg: DayFlightRequirementLeg;
  readonly flights: readonly Flight[];
  readonly flightLegs: readonly FlightLeg[];

  // Duplicates:
  readonly label: string;
  readonly category: string;
  readonly stc: Stc;
  readonly aircraftRegister?: PreplanAircraftRegister;
  readonly rsx: Rsx;
  readonly day: Weekday;
  readonly notes: string;
  readonly index: number;
  readonly flightNumber: FlightNumber;
  readonly departureAirport: Airport;
  readonly arrivalAirport: Airport;
  readonly blockTime: Daytime;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;

  // Computational:
  readonly derivedId: Id;
  readonly sta: Daytime;
  readonly transit: boolean;
  readonly international: boolean;
  readonly dayOffset: number;
  readonly actualStd: Daytime;
  readonly actualSta: Daytime;
  readonly actualDepartureDay: Weekday;
  readonly actualArrivalDay: Weekday;

  // readonly weekStd: number;
  // readonly weekSta: number;
  // readonly stdDateTime: Date;
  // readonly staDateTime: Date;

  constructor(flightLeg: FlightLeg, flightView: FlightView, localtime: boolean) {
    this.std = flightLeg.std;

    this.label = flightLeg.label;
    this.category = flightLeg.category;
    this.stc = flightLeg.stc;
    this.aircraftRegister = flightLeg.aircraftRegister;
    this.rsx = flightLeg.rsx;
    this.day = this.actualDepartureDay = this.actualArrivalDay = flightLeg.day;
    this.index = flightLeg.index;
    this.flightNumber = flightLeg.flightNumber;
    this.departureAirport = flightLeg.departureAirport;
    this.arrivalAirport = flightLeg.arrivalAirport;
    this.blockTime = flightLeg.blockTime;
    this.originPermission = flightLeg.originPermission;
    this.destinationPermission = flightLeg.destinationPermission;

    this.flightView = flightView;
    this.flightRequirement = flightLeg.flightRequirement;
    this.flightRequirementLeg = flightLeg.flightRequirementLeg;
    this.dayFlightRequirement = flightLeg.dayFlightRequirement;
    this.dayFlightRequirementLeg = flightLeg.dayFlightRequirementLeg;
    this.flights = flightView.flights;
    this.flightLegs = this.flights.map(f => f.legs.find(l => l.day === this.actualDepartureDay)!).sortBy('weekStd');

    this.derivedId = `${flightView.derivedId}#${this.index}`;
    this.sta = flightLeg.sta;
    this.transit = flightLeg.transit;
    this.international = flightLeg.international;
    this.dayOffset = flightLeg.dayOffset;
    this.actualStd = flightLeg.actualStd;

    this.actualStd = localtime ? new Daytime(flightLeg.localStd, flightLeg.flight.date) : flightLeg.actualStd;
    while (this.actualStd.minutes < 0) {
      this.actualDepartureDay -= 1;
      this.actualStd = new Daytime(this.actualStd.minutes + 24 * 60);
    }

    if (this.actualDepartureDay < 0) {
      this.actualDepartureDay += 7;
    }

    this.actualDepartureDay += Math.floor(this.actualStd.minutes / (24 * 60));
    this.actualDepartureDay > 7 && (this.actualDepartureDay %= 7);
    this.actualStd = new Daytime(this.actualStd.minutes % (24 * 60));

    this.actualSta = localtime ? new Daytime(flightLeg.localSta, flightLeg.flight.date) : flightLeg.actualSta;
    while (this.actualSta.minutes < 0) {
      this.actualArrivalDay -= 1;
      this.actualSta = new Daytime(this.actualSta.minutes + 24 * 60);
    }

    if (this.actualArrivalDay < 0) {
      this.actualArrivalDay += 7;
    }

    this.actualArrivalDay += Math.floor(this.actualSta.minutes / (24 * 60));
    this.actualArrivalDay > 7 && (this.actualArrivalDay %= 7);
    this.actualSta = new Daytime(this.actualSta.minutes % (24 * 60));

    // this.weekStd = flightLeg.weekStd;
    // this.weekSta = flightLeg.weekSta;

    // Fields which should be calculated for view:
    this.notes = flightLeg.notes;
    // this.stdDateTime = new Date(week.startDate.getTime() + this.weekStd * 60 * 1000);
    // this.staDateTime = new Date(week.startDate.getTime() + this.weekSta * 60 * 1000);
  }
}
