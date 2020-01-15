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
import FlightPackView from 'src/business/flight/FlightPackView';

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

    readonly current: boolean;
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
    this.versions = raw.versions.map<Preplan['versions'][number]>(version => ({
      id: version.id,
      current: version.current,
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
      const days = flightRequirement.changes.find(c => c.startDate <= date && date <= c.endDate)?.days;
      const dayFlightRequirementChange = !days ? undefined : days.find(d => d.day === weekday);
      return new Flight(f, this.aircraftRegisters, dayFlightRequirement, dayFlightRequirementChange);
    });

    this.flightLegs = this.flights.map(f => f.legs).flatten();
    this.flightsByAircraftRegisterId = this.flights.groupBy(f => (f.aircraftRegister === undefined ? '???' : f.aircraftRegister.id));
    this.flightLegsByAircraftRegisterId = this.flightLegs.groupBy(f => (f.aircraftRegister === undefined ? '???' : f.aircraftRegister.id));
    ['???', ...this.aircraftRegisters.items.filter(a => a.options.status !== 'IGNORED').map(a => a.id)].forEach(id => {
      id in this.flightsByAircraftRegisterId || ((this.flightsByAircraftRegisterId as { [aircraftRegisterId: string]: readonly Flight[] })[id] = []);
      id in this.flightLegsByAircraftRegisterId || ((this.flightLegsByAircraftRegisterId as { [aircraftRegisterId: string]: readonly FlightLeg[] })[id] = []);
    });

    const flightsGrouppedByWeekStartTime = this.flights.groupBy(f => String(Week.getWeekStartDate(f.date).getTime()));
    this.weeks = new Weeks(this.startDate, this.endDate, (previousWeek, nextWeek) => {
      const previousFlightsByWeek = flightsGrouppedByWeekStartTime[String(previousWeek.startDate.getTime())];
      const nextFlightsByWeek = flightsGrouppedByWeekStartTime[String(nextWeek.startDate.getTime())];
      if (!previousFlightsByWeek && !nextFlightsByWeek) return false;
      if (!previousFlightsByWeek || !nextFlightsByWeek) return true;
      const grouppedPreviousFlightByWeek = previousFlightsByWeek.groupBy('label', g => g.groupBy('day', h => h[0]));
      const grouppedNextFlightByWeek = nextFlightsByWeek.groupBy('label', g => g.groupBy('day', h => h[0]));
      for (let label in grouppedPreviousFlightByWeek) {
        const previousFlightsByWeekAndLabel = grouppedPreviousFlightByWeek[label];
        const nextFlightsByWeekAndLabel = grouppedNextFlightByWeek[label];
        if (!nextFlightsByWeekAndLabel) {
          if (nextWeek.endDate > this.endDate) {
            const lastDay = (this.endDate.getDay() + 1) % 7;
            if (Object.keys(previousFlightsByWeekAndLabel).some(f => +f <= lastDay)) {
              return true;
            } else {
              continue;
            }
          }
          return true;
        }

        for (let day in previousFlightsByWeekAndLabel) {
          const previousFlight = previousFlightsByWeekAndLabel[day];
          const nextFlight = nextFlightsByWeekAndLabel[day];
          if (
            (!nextFlight ||
              previousFlight.aircraftRegister !== nextFlight.aircraftRegister ||
              previousFlight.legs.some((l, index) => l.std.compare(nextFlight.legs[index].std) !== 0) ||
              previousFlight.legs.some((l, index) => l.blockTime.compare(nextFlight.legs[index].blockTime) !== 0) ||
              previousFlight.rsx !== nextFlight.rsx ||
              previousFlight.notes !== nextFlight.notes ||
              previousFlight.originPermission !== nextFlight.originPermission ||
              previousFlight.destinationPermission !== nextFlight.destinationPermission) &&
            this.endDate.getDatePart().getTime() >=
              new Date(previousFlight.date)
                .getDatePart()
                .addDays(7)
                .getTime()
          )
            return true;
        }
        for (let day in nextFlightsByWeekAndLabel) {
          const nextFlight = nextFlightsByWeekAndLabel[day];
          const previousFlight = previousFlightsByWeekAndLabel[day];
          if (
            !previousFlight &&
            this.startDate.getDatePart().getTime() <=
              new Date(nextFlight.date)
                .getDatePart()
                .addDays(-7)
                .getTime()
          )
            return true;
        }
      }
      return false;
    });

    this.constraintSystem = new ConstraintSystem(this, oldPreplan && oldPreplan.constraintSystem);

    this.readonly = this.user.id !== persistant.user!.id || !this.current;
  }

  getFlightViews(startWeek: Week, endWeek: Week, week?: Week): FlightView[] {
    return Object.values(
      this.flights
        .filter(f => startWeek.startDate <= f.date && f.date <= endWeek.endDate)
        .groupBy(
          f => f.flightRequirement.id,
          g => Object.values(g.groupBy('day', h => new FlightView(h, startWeek, endWeek, week ?? startWeek, this.startDate, this.endDate)))
        )
    ).flatten();
  }

  getFlightPackViews(startWeek: Week, endWeek: Week, week?: Week): FlightPackView[] {
    return Object.values(
      this.flights
        .filter(f => startWeek.startDate <= f.date && f.date <= endWeek.endDate)
        .groupBy(
          f => f.flightRequirement.id,
          g => Object.values(g.groupBy('day', h => FlightPackView.create(h, startWeek, endWeek, week ?? startWeek, this.startDate, this.endDate)))
        )
    ).flat(2);
  }
}
