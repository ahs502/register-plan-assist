import PreplanHeader from 'src/business/preplan/PreplanHeader';
import { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Flight from 'src/business/flight/Flight';
import ConstraintSystem from 'src/business/constraints/ConstraintSystem';
import PreplanModel from '@core/models/preplan/PreplanModel';
import FlightLeg from 'src/business/flight/FlightLeg';

export default class Preplan extends PreplanHeader {
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

  constructor(raw: PreplanModel, oldPreplan?: Preplan) {
    super(raw);
    this.aircraftRegisters = new PreplanAircraftRegisters(raw.dummyAircraftRegisters, raw.aircraftRegisterOptions, this);
    this.flightRequirements = raw.flightRequirements.map(f => new FlightRequirement(f, this.aircraftRegisters));
    const flightRequirementDictionary = this.flightRequirements.toDictionary('id');
    this.flights = raw.flights
      .map(f => new Flight(f, flightRequirementDictionary[f.flightRequirementId].days.find(d => d.day === f.day)!, this.aircraftRegisters))
      .sortBy('weekStart');

    this.flightLegs = this.flights
      .map(f => f.legs)
      .flatten()
      .sortBy('weekStd');
    this.flightsByAircraftRegisterId = this.flights.groupBy(f => (f.aircraftRegister === undefined ? '???' : f.aircraftRegister.id));
    this.flightLegsByAircraftRegisterId = this.flightLegs.groupBy(f => (f.aircraftRegister === undefined ? '???' : f.aircraftRegister.id));
    ['???', ...this.aircraftRegisters.items.filter(a => a.options.status !== 'IGNORED').map(a => a.id)].forEach(id => {
      id in this.flightsByAircraftRegisterId || ((this.flightsByAircraftRegisterId as { [aircraftRegisterId: string]: readonly Flight[] })[id] = []);
      id in this.flightLegsByAircraftRegisterId || ((this.flightLegsByAircraftRegisterId as { [aircraftRegisterId: string]: readonly FlightLeg[] })[id] = []);
    });

    this.constraintSystem = new ConstraintSystem(this, oldPreplan && oldPreplan.constraintSystem);
  }
}
