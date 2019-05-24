import { DummyAircraftRegister, AircraftRegisters } from './AircraftRegister';
import IClonable from './IClonable';

export default class Preplan implements IClonable<Preplan> {
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

  dummyAircraftRegisters: DummyAircraftRegister[];

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
    dummyAircraftRegisters: DummyAircraftRegister[]
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

    this.dummyAircraftRegisters = dummyAircraftRegisters;

    this.aircraftRegisters = new AircraftRegisters(dummyAircraftRegisters);
  }

  clone(): Preplan {
    return new Preplan(
      this.id,
      this.name,
      this.published,
      this.finalized,
      this.userId,
      this.userName,
      this.userDisplayName,
      this.parentPreplanId,
      this.parentPreplanName,
      this.creationDateTime,
      this.lastEditDateTime,
      this.startDate,
      this.endDate,
      this.simulationId,
      this.simulationName,
      this.dummyAircraftRegisters.map(a => ({ ...a }))
    );
  }
}
