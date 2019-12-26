import { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Flight from 'src/business/flight/Flight';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import FlightLeg from 'src/business/flight/FlightLeg';
import persistant from 'src/utils/persistant';
import Id from '@core/types/Id';
import User from 'src/business/User';
import PreplanDataModel from '@core/models/preplan/PreplanDataModel';
import { dataTypes } from 'src/utils/DataType';
import Week, { Weeks } from 'src/business/Week';
import FlightView from 'src/business/flight/FlightView';

export default class Preplan {
  readonly id: Id;
  readonly headerId: Id;

  readonly name: string;
  readonly published: boolean;
  readonly accepted: boolean;

  readonly user: User;

  readonly parentPreplanHeader?: {
    readonly id: Id;
    readonly name: string;
    readonly user: User;
  };

  readonly current: boolean;
  readonly creationDateTime: Date;
  readonly lastEditDateTime: Date;
  readonly description: string;

  readonly startDate: Date;
  readonly endDate: Date;
  readonly weeks: Weeks;

  readonly versions: readonly {
    readonly id: Id;
    readonly lastEditDateTime: Date;
    readonly description: string;
  }[];

  readonly simulation?: {
    readonly id: Id;
    readonly name: string;
  };

  /**
   * The enhanced aircraft registers for this preplan.
   * It must be used instead of the similar collection within MasterData.
   * @see MasterData.aircraftRegisters as the general (not preplan specific) collection.
   */
  readonly aircraftRegisters: PreplanAircraftRegisters;
  readonly flightRequirements: readonly FlightRequirement[];
  readonly flights: readonly Flight[];

  readonly flightLegs: readonly FlightLeg[];
  readonly flightsByAircraftRegisterId: { readonly [aircraftRegisterId: string]: readonly Flight[] };
  readonly flightLegsByAircraftRegisterId: { readonly [aircraftRegisterId: string]: readonly FlightLeg[] };

  readonly constraintSystem: ConstraintSystem;

  readonly readonly: boolean;

  constructor(raw: PreplanDataModel, oldPreplan?: Preplan) {
    this.id = raw.preplan.id;
    this.headerId = raw.header.id;
    this.name = raw.header.name;
    this.published = raw.header.published;
    this.accepted = raw.header.accepted;
    this.user = new User(raw.header.user);
    this.current = raw.preplan.current;
    this.creationDateTime = dataTypes.utcDate.convertModelToBusiness(raw.header.creationDateTime);
    this.lastEditDateTime = dataTypes.utcDate.convertModelToBusiness(raw.preplan.lastEditDateTime);
    this.description = dataTypes.name.convertModelToBusiness(raw.preplan.description);
    this.startDate = dataTypes.utcDate.convertModelToBusiness(raw.header.startDate);
    this.endDate = dataTypes.utcDate.convertModelToBusiness(raw.header.endDate);
    this.weeks = new Weeks(this.startDate, this.endDate);
    this.versions = raw.versions.map<Preplan['versions'][number]>(version => ({
      id: version.id,
      lastEditDateTime: dataTypes.utcDate.convertModelToBusiness(version.lastEditDateTime),
      description: dataTypes.name.convertModelToBusiness(version.description)
    }));
    this.aircraftRegisters = new PreplanAircraftRegisters(raw.preplan.dummyAircraftRegisters, raw.preplan.aircraftRegisterOptions, this);
    this.flightRequirements = raw.flightRequirements.map(f => new FlightRequirement(f, this.aircraftRegisters));
    const flightRequirementDictionary = this.flightRequirements.toDictionary('id');
    this.flights = raw.flights.map(f => {
      const date = dataTypes.utcDate.convertModelToBusiness(f.date);
      const weekday = date.getWeekday();
      const flightRequirement = flightRequirementDictionary[f.flightRequirementId];
      const dayFlightRequirement = flightRequirement.days.find(d => d.day === weekday)!;
      const dayFlightRequirementChange = flightRequirement.changes.find(c => c.startDate <= date && date <= c.endDate)?.days.find(d => d.day === weekday) ?? undefined;
      return new Flight(f, this.aircraftRegisters, dayFlightRequirement, dayFlightRequirementChange);
    });

    this.flightLegs = this.flights.map(f => f.legs).flatten();
    this.flightsByAircraftRegisterId = this.flights.groupBy(f => (f.aircraftRegister === undefined ? '???' : f.aircraftRegister.id));
    this.flightLegsByAircraftRegisterId = this.flightLegs.groupBy(f => (f.aircraftRegister === undefined ? '???' : f.aircraftRegister.id));
    ['???', ...this.aircraftRegisters.items.filter(a => a.options.status !== 'IGNORED').map(a => a.id)].forEach(id => {
      id in this.flightsByAircraftRegisterId || ((this.flightsByAircraftRegisterId as { [aircraftRegisterId: string]: readonly Flight[] })[id] = []);
      id in this.flightLegsByAircraftRegisterId || ((this.flightLegsByAircraftRegisterId as { [aircraftRegisterId: string]: readonly FlightLeg[] })[id] = []);
    });

    this.constraintSystem = new ConstraintSystem(this, oldPreplan && oldPreplan.constraintSystem);

    this.readonly = this.user.id !== persistant.user!.id || !this.current;
  }

  getFlightViews(startWeek: Week, endWeek: Week): FlightView[] {
    return Object.values(
      this.flights
        .filter(f => startWeek.startDate <= f.date && f.date <= endWeek.endDate)
        .groupBy(
          f => f.flightRequirement.id,
          g => Object.values(g.groupBy('day', h => new FlightView(h, startWeek, endWeek)))
        )
    ).flatten();
  }
}
