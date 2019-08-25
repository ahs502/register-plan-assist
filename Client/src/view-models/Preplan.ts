import PreplanModel, { PreplanHeaderModel } from '@core/models/PreplanModel';
import { PreplanAircraftRegisters } from './PreplanAircraftRegister';
import AutoArrangerState from './AutoArrangerState';
import FlightRequirement from './flights/FlightRequirement';
import Flight from './flights/Flight';
import AutoArrangerOptions from './AutoArrangerOptions';
import FlightPack from './flights/FlightPack';

export class PreplanHeader {
  readonly id: string;

  readonly name: string;
  readonly published: boolean;
  readonly finalized: boolean;

  readonly userId: string;
  readonly userName: string;
  readonly userDisplayName: string;

  readonly parentPreplanId?: string;
  readonly parentPreplanName?: string;

  readonly creationDateTime: Date;
  readonly lastEditDateTime: Date;

  readonly startDate: Date;
  readonly endDate: Date;

  readonly simulationId?: string;
  readonly simulationName?: string;

  constructor(raw: PreplanHeaderModel) {
    this.id = raw.id;
    this.name = raw.name;
    this.published = raw.published;
    this.finalized = raw.finalized;
    this.userId = raw.userId;
    this.userName = raw.userName;
    this.userDisplayName = raw.userDisplayName;
    this.parentPreplanId = raw.parentPreplanId;
    this.parentPreplanName = raw.parentPreplanName;
    this.creationDateTime = new Date(raw.creationDateTime);
    this.lastEditDateTime = new Date(raw.lastEditDateTime);
    this.startDate = new Date(raw.startDate);
    this.endDate = new Date(raw.endDate);
    this.simulationId = raw.simulationId;
    this.simulationName = raw.simulationName;
  }
}

export default class Preplan extends PreplanHeader {
  private allFlights?: readonly Flight[];
  private allFlightPacks?: readonly FlightPack[];

  autoArrangerOptions: AutoArrangerOptions;
  autoArrangerState: AutoArrangerState;

  /**
   * The enhanced aircraft registers for this preplan.
   * It must be used instead of the similar collection within MasterData.
   * @see MasterData.aircraftRegisters as the general (not preplan specific) collection.
   */
  readonly aircraftRegisters: PreplanAircraftRegisters;

  readonly flightRequirements: readonly FlightRequirement[];

  constructor(raw: PreplanModel) {
    super(raw);
    this.autoArrangerOptions = raw.autoArrangerOptions ? new AutoArrangerOptions(raw.autoArrangerOptions) : AutoArrangerOptions.default;
    this.aircraftRegisters = new PreplanAircraftRegisters(raw.dummyAircraftRegisters, raw.aircraftRegisterOptionsDictionary);
    this.flightRequirements = raw.flightRequirements.map(f => new FlightRequirement(f, this.aircraftRegisters));
    this.autoArrangerState = new AutoArrangerState(raw.autoArrangerState, this.aircraftRegisters, this.flights);
  }

  /**
   * Gets the flattened list of this preplan's flights.
   * It won't be changed by reference until something is changed within.
   */
  get flights(): readonly Flight[] {
    if (this.allFlights) return this.allFlights;
    return (this.allFlights = this.flightRequirements.map(w => w.days.map(d => d.flight)).flatten());
  }

  /**
   * Gets the packed format of this preplan's flights.
   * It won't be changed by reference until something is changed within.
   */
  get flightPacks(): readonly FlightPack[] {
    if (this.allFlightPacks) return this.allFlightPacks;
    return (this.allFlightPacks = []); //...
  }

  mergeFlightRequirements(...flightRequirements: FlightRequirement[]): void {
    this.allFlights = [];
    this.allFlightPacks = [];
    const allFlightRequirements = this.flightRequirements as FlightRequirement[];
    allFlightRequirements.forEach((f, i) => {
      if (flightRequirements.length === 0) return;
      const j = flightRequirements.findIndex(h => h.id === f.id);
      if (j < 0) return;
      allFlightRequirements.splice(i, 1, flightRequirements.splice(j, 1)[0]);
    });
    flightRequirements.forEach(h => allFlightRequirements.push(h));
  }

  removeFlightRequirement(flightRequirementId: string): void {
    this.allFlights = [];
    this.allFlightPacks = [];
    const allFlightRequirements = this.flightRequirements as FlightRequirement[];
    allFlightRequirements.splice(allFlightRequirements.findIndex(f => f.id === flightRequirementId), 1);
  }
}
