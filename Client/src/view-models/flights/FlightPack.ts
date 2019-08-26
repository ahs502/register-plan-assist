import PreplanAircraftRegister from 'src/view-models/PreplanAircraftRegister';
import Daytime from '@core/types/Daytime';
import Flight from './Flight';

export default class FlightPack {
  readonly derivedId: string;
  readonly label: string;
  readonly aircraftRegister?: PreplanAircraftRegister;
  readonly flights: readonly Flight[];
  readonly day: number;
  readonly start: Daytime;
  readonly end: Daytime;
  readonly sections: readonly {
    readonly start: number;
    readonly end: number;
  }[];
  readonly icons: readonly string[];
  readonly notes: string;

  constructor(flight: Flight) {
    this.derivedId = flight.derivedId;
    this.label = flight.label;
    this.aircraftRegister = flight.aircraftRegister;
    this.flights = [flight];
    this.day = flight.day;
    this.start = flight.std;
    this.end = new Daytime(flight.std.minutes + flight.blockTime);
    this.sections = [{ start: 0, end: 1 }];
    // this.icons = [flight.required ? 'R' : '', flight.freezed ? 'F' : '', flight.departurePermission && flight.arrivalPermission ? '' : 'P'].filter(Boolean);
    this.icons = [Math.random() < 0.25 ? 'R' : '', Math.random() < 0.25 ? 'F' : '', Math.random() < 0.25 ? 'P' : ''].filter(Boolean);
    // this.notes = flight.notes;
    this.notes = Math.random() < 0.4 ? '' : ['note', 'a longer note', 'some very very long note'][Math.floor(Math.random() * 3)];
  }

  append(flight: Flight): void {
    (this.flights as Flight[]).push(flight);
    (this as { end: Daytime }).end = new Daytime((flight.day - this.day) * 24 * 60 + flight.std.minutes + flight.blockTime);
  }

  close(): void {
    (this as {
      sections: readonly {
        readonly start: number;
        readonly end: number;
      }[];
    }).sections = this.flights.map(f => {
      const dayDiff = (f.day - this.day) * 24 * 60;
      return {
        start: (dayDiff + f.std.minutes - this.start.minutes) / (this.end.minutes - this.start.minutes),
        end: (dayDiff + f.std.minutes + f.blockTime - this.start.minutes) / (this.end.minutes - this.start.minutes)
      };
    });
  }
}
