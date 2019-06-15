import AutoArrangerOptions, { defaultAutoArrangerOptions } from './AutoArrangerOptions';
import { DummyAircraftRegisterModel, AircraftRegisters, AircraftRegisterOptionsDictionary } from './AircraftRegister';
import FlightRequirement, { FlightRequirementModel } from './FlightRequirement';

export interface PreplanHeaderModel {
  id: string;

  name: string;
  published: boolean;
  finalized: boolean;

  userId: string;
  userName: string;
  userDisplayName: string;

  parentPreplanId?: string;
  parentPreplanName?: string;

  creationDateTime: Date;
  lastEditDateTime: Date;

  startDate: Date;
  endDate: Date;

  simulationId?: string;
  simulationName?: string;
}

export interface PreplanModel extends PreplanHeaderModel {
  autoArrangerOptions?: Readonly<AutoArrangerOptions>;

  dummyAircraftRegisters: ReadonlyArray<Readonly<DummyAircraftRegisterModel>>;
  aircraftRegisterOptionsDictionary: Readonly<AircraftRegisterOptionsDictionary>;

  flightRequirements: ReadonlyArray<Readonly<FlightRequirementModel>>;
}

export default class Preplan implements PreplanHeaderModel {
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

  autoArrangerOptions: Readonly<AutoArrangerOptions>;

  /**
   * The enhanced aircraft registers for this preplan.
   * It must be used instead of the similar collection within MasterData.
   * @see MasterData.aircraftRegisters as the general (not preplan specific) collection.
   */
  readonly aircraftRegisters: AircraftRegisters;

  flightRequirements: ReadonlyArray<FlightRequirement>;

  constructor(raw: PreplanModel) {
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
    this.autoArrangerOptions = raw.autoArrangerOptions || defaultAutoArrangerOptions;
    this.aircraftRegisters = new AircraftRegisters(raw.dummyAircraftRegisters, raw.aircraftRegisterOptionsDictionary);
    this.flightRequirements = raw.flightRequirements.map(f => new FlightRequirement(f));
  }
}
