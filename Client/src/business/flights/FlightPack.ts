import PreplanAircraftRegister from 'src/business/PreplanAircraftRegister';
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
  readonly knownAircraftRegister: boolean;
  readonly required: boolean | undefined;
  readonly freezed: boolean | undefined;
  readonly originPermission: boolean | undefined;
  readonly destinationPermission: boolean | undefined;
  readonly changed: boolean | undefined;
  readonly icons: readonly string[]; //TODO: Check if it is really required.
  readonly notes: string;

  constructor(flight: Flight, changed: boolean) {
    (flight as { pack: FlightPack }).pack = this;
    this.derivedId = flight.derivedId;
    this.label = flight.label;
    this.aircraftRegister = flight.aircraftRegister;
    this.flights = [flight];
    this.day = flight.day;
    this.start = flight.std;
    this.end = new Daytime(flight.std.minutes + flight.blockTime);
    this.sections = [{ start: 0, end: 1 }];
    this.knownAircraftRegister = !!flight.aircraftRegister && !flight.aircraftRegister.dummy;
    this.required = flight.required;
    this.freezed = flight.freezed;
    this.originPermission = flight.originPermission;
    this.destinationPermission = flight.destinationPermission;
    this.changed = changed;
    this.icons = [];
    this.notes = flight.notes;
  }

  append(flight: Flight, changed: boolean): void {
    (flight as { pack: FlightPack }).pack = this;
    const flightPack = (this as unknown) as {
      flights: Flight[];
      end: Daytime;
      required: boolean | undefined;
      freezed: boolean | undefined;
      originPermission: boolean | undefined;
      destinationPermission: boolean | undefined;
      changed: boolean | undefined;
    };
    flightPack.flights.push(flight);
    flightPack.end = new Daytime((flight.day - this.day) * 24 * 60 + flight.std.minutes + flight.blockTime);
    flightPack.required !== undefined && flightPack.required !== flight.required && delete flightPack.required;
    flightPack.freezed !== undefined && flightPack.freezed !== flight.freezed && delete flightPack.freezed;
    flightPack.originPermission !== undefined && flightPack.originPermission !== flight.originPermission && delete flightPack.originPermission;
    flightPack.destinationPermission !== undefined && flightPack.destinationPermission !== flight.destinationPermission && delete flightPack.destinationPermission;
    flightPack.changed !== undefined && flightPack.changed !== changed && delete flightPack.changed;
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

  get weekStart(): number {
    return this.day * 24 * 60 + this.start.minutes;
  }
  get weekEnd(): number {
    return this.day * 24 * 60 + this.end.minutes;
  }

  startDateTime(startDate: Date): Date {
    return new Date(startDate.getTime() + this.weekStart * 60 * 1000);
  }
  endDateTime(startDate: Date): Date {
    return new Date(startDate.getTime() + this.weekEnd * 60 * 1000);
  }
}
