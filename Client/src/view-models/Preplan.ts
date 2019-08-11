import PreplanModel, { PreplanHeaderModel } from '@core/models/PreplanModel';
import { PreplanAircraftRegisters } from './PreplanAircraftRegister';
import AutoArrangerState from './AutoArrangerState';
import FlightRequirement from './flights/FlightRequirement';
import Flight from './flights/Flight';
import AutoArrangerOptions from './AutoArrangerOptions';

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
  autoArrangerOptions: AutoArrangerOptions;
  autoArrangerState: AutoArrangerState;

  /**
   * The enhanced aircraft registers for this preplan.
   * It must be used instead of the similar collection within MasterData.
   * @see MasterData.aircraftRegisters as the general (not preplan specific) collection.
   */
  readonly aircraftRegisters: PreplanAircraftRegisters;

  flightRequirements: readonly FlightRequirement[];

  constructor(raw: PreplanModel) {
    super(raw);
    this.autoArrangerOptions = raw.autoArrangerOptions ? new AutoArrangerOptions(raw.autoArrangerOptions) : AutoArrangerOptions.default;
    this.aircraftRegisters = new PreplanAircraftRegisters(raw.dummyAircraftRegisters, raw.aircraftRegisterOptionsDictionary);
    this.flightRequirements = raw.flightRequirements.map(f => new FlightRequirement(f, this.aircraftRegisters));
    this.autoArrangerState = new AutoArrangerState(raw.autoArrangerState, this.aircraftRegisters, this.flights);
  }

  /**
   * Gets the flattened list of this preplan's flights.
   * > **NOTE:** USE WITH CAUTION, IT IS A COMPUTED PROPERTY AND HAS PROCESSING COSTS.
   */
  get flights(): readonly Flight[] {
    return this.flightRequirements.map(w => w.days.map(d => d.flight)).flatten();
  }
}
