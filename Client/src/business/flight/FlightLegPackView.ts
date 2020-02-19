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
import FlightLeg from 'src/business/flight/FlightLeg';
import Week from 'src/business/Week';
import FlightPackView from 'src/business/flight/FlightPackView';

export default class FlightLegPackView {
  // Original:
  readonly std: Daytime;

  // References:
  readonly flightPackView: FlightPackView;
  readonly flightRequirement: FlightRequirement;
  readonly flightRequirementLeg: FlightRequirementLeg;
  readonly dayFlightRequirement: DayFlightRequirement;
  readonly dayFlightRequirementLeg: DayFlightRequirementLeg;
  // readonly flights: readonly Flight[];
  // readonly flightLegs: readonly FlightLeg[];

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
  readonly utcStd: Date;
  readonly localStd: Date;
  readonly utcSta: Date;
  readonly localSta: Date;
  readonly actualDepartureDay: Weekday;
  readonly actualArrivalDay: Weekday;

  // Computational:
  readonly derivedId: Id;
  readonly international: boolean;
  readonly hasDstInDeparture: boolean;
  readonly hasDstInArrival: boolean;
  readonly diffWithFirstLeg: number;
  possibleStartDate: Date;
  possibleEndDate: Date;

  constructor(flightLeg: FlightLeg, flightPackView: FlightPackView, sourceFlight: Flight, allDaysBaseOfFirstLeg: Date[]) {
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
    this.utcStd = flightLeg.utcStd;
    this.localStd = flightLeg.localStd;
    this.utcSta = flightLeg.utcSta;
    this.localSta = flightLeg.localSta;

    this.flightPackView = flightPackView;
    this.flightRequirement = flightLeg.flightRequirement;
    this.flightRequirementLeg = flightLeg.flightRequirementLeg;
    this.dayFlightRequirement = flightLeg.dayFlightRequirement;
    this.dayFlightRequirementLeg = flightLeg.dayFlightRequirementLeg;
    // this.flights = flightPackView.flights;
    // this.flightLegs = this.flights.map(f => f.legs.find(l => l.day === this.day)!).sortBy('weekStd');

    this.derivedId = `${flightPackView.derivedId}#${this.index}`;
    this.international = flightLeg.international;

    let actualStd = new Daytime(flightLeg.localStd, flightLeg.flight.date);

    if (actualStd.minutes < 0) {
      while (actualStd.minutes < 0) {
        this.actualDepartureDay -= 1;
        actualStd = new Daytime(actualStd.minutes + 24 * 60);
      }

      if (this.actualDepartureDay < 0) {
        this.actualDepartureDay += 7;
      }
    } else {
      this.actualDepartureDay += Math.floor(actualStd.minutes / (24 * 60));
      this.actualDepartureDay > 7 && (this.actualDepartureDay %= 7);
      //actualStd = new Daytime(actualStd.minutes % (24 * 60));
    }

    let actualSta = new Daytime(flightLeg.localSta, flightLeg.flight.date);
    if (actualSta.minutes < 0) {
      while (actualSta.minutes < 0) {
        this.actualArrivalDay -= 1;
        actualSta = new Daytime(actualSta.minutes + 24 * 60);
      }

      if (this.actualArrivalDay < 0) {
        this.actualArrivalDay += 7;
      }
    } else {
      this.actualArrivalDay += Math.floor(actualSta.minutes / (24 * 60));
      this.actualArrivalDay > 7 && (this.actualArrivalDay %= 7);
      //this.actualSta = new Daytime(this.actualSta.minutes % (24 * 60));
    }

    this.hasDstInDeparture = flightLeg.departureAirport.utcOffsets.some(
      u => u.dst && u.startDateTimeUtc.getTime() <= flightLeg.utcStd.getTime() && flightLeg.utcStd.getTime() <= u.endDateTimeUtc.getTime()
    );
    this.hasDstInArrival = flightLeg.arrivalAirport.utcOffsets.some(
      u => u.dst && u.startDateTimeUtc.getTime() <= flightLeg.utcSta.getTime() && flightLeg.utcSta.getTime() <= u.endDateTimeUtc.getTime()
    );

    this.possibleStartDate = allDaysBaseOfFirstLeg[0];
    this.possibleEndDate = allDaysBaseOfFirstLeg.last()!;

    // Fields which should be calculated for view:
    this.notes = flightLeg.notes;

    this.diffWithFirstLeg = this.localStd.getUTCDay() - sourceFlight.legs[0].localStd.getUTCDay();
    if (this.diffWithFirstLeg !== 0) {
      if (this.diffWithFirstLeg < 0) {
        this.diffWithFirstLeg = this.diffWithFirstLeg + 7;
      }

      this.possibleStartDate = new Date(this.possibleStartDate).addDays(this.diffWithFirstLeg);
      this.possibleEndDate = new Date(this.possibleEndDate).addDays(this.diffWithFirstLeg);
    }
  }
}
