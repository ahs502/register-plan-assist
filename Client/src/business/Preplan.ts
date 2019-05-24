import AutoArrangerOptions, { defaultAutoArrangerOptions } from './AutoArrangerOptions';
import { DummyAircraftRegister, AircraftRegisters, AircraftRegisterOptionsDictionary } from './AircraftRegister';

export interface PreplanHeader {
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
}

export default class Preplan implements PreplanHeader {
  //TODO: Revise access modifiers.

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

  autoArrangerOptions: AutoArrangerOptions;

  dummyAircraftRegisters: DummyAircraftRegister[];
  aircraftRegisterOptionsDictionary: AircraftRegisterOptionsDictionary;

  // Calculated fields:

  /**
   * The enhanced aircraft registers for this preplan.
   * It must be used instead of the similar collection within MasterData.
   * @see MasterData.aircraftRegisters as the general (not preplan specific) collection.
   */
  aircraftRegisters: AircraftRegisters;

  constructor(
    id: string,
    name: string,
    published: boolean,
    finalized: boolean,
    userId: string,
    userName: string,
    userDisplayName: string,
    parentPreplanId: string | undefined,
    parentPreplanName: string | undefined,
    creationDateTime: Date,
    lastEditDateTime: Date,
    startDate: Date,
    endDate: Date,
    simulationId: string | undefined,
    simulationName: string | undefined,
    autoArrangerOptions: AutoArrangerOptions | undefined,
    dummyAircraftRegisters: DummyAircraftRegister[],
    aircraftRegisterOptionsDictionary: AircraftRegisterOptionsDictionary
  ) {
    this.id = id;

    this.name = name;
    this.published = published;
    this.finalized = finalized;

    this.userId = userId;
    this.userName = userName;
    this.userDisplayName = userDisplayName;

    this.parentPreplanId = parentPreplanId;
    this.parentPreplanName = parentPreplanName;

    this.creationDateTime = creationDateTime;
    this.lastEditDateTime = lastEditDateTime;

    this.startDate = startDate;
    this.endDate = endDate;

    this.simulationId = simulationId;
    this.simulationName = simulationName;

    this.autoArrangerOptions = autoArrangerOptions || defaultAutoArrangerOptions;

    this.dummyAircraftRegisters = dummyAircraftRegisters;
    this.aircraftRegisters = new AircraftRegisters(dummyAircraftRegisters, aircraftRegisterOptionsDictionary);
    this.aircraftRegisterOptionsDictionary = this.aircraftRegisters.extractAircraftRegisterOptionsDictionary();
  }
}
