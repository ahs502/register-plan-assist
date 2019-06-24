import { ObjectID } from 'mongodb';
import AutoArrangerOptionsEntity from './AutoArrangerOptionsEntity';
import DummyAircraftRegisterEntity from './DummyAircraftRegisterEntity';
import { AircraftRegisterOptionsDictionary } from '@core/types/AircraftRegisterOptions';
import PreplanModel, { PreplanHeaderModel } from '@core/models/PreplanModel';
import FlightRequirementEntity, { convertFlightRequirementEntityToModel } from './FlightRequirementEntity';

export interface PreplanHeaderEntity {
  readonly _id?: ObjectID;
  readonly name: string;
  readonly published: boolean;
  readonly finalized: boolean;
  readonly userId: string;
  readonly userName: string;
  readonly userDisplayName: string;
  readonly parentPreplanId?: ObjectID;
  readonly parentPreplanName?: string;
  readonly creationDateTime: Date;
  readonly lastEditDateTime: Date;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly simulationId?: string;
  readonly simulationName?: string;
}

export default interface PreplanEntity extends PreplanHeaderEntity {
  readonly autoArrangerOptions?: AutoArrangerOptionsEntity;
  readonly dummyAircraftRegisters: readonly DummyAircraftRegisterEntity[];
  readonly aircraftRegisterOptionsDictionary: AircraftRegisterOptionsDictionary;
}

export const preplanHeaderProjection = {
  name: 1,
  published: 1,
  finalized: 1,
  userId: 1,
  userName: 1,
  userDisplayName: 1,
  parentPreplanId: 1,
  parentPreplanName: 1,
  creationDateTime: 1,
  lastEditDateTime: 1,
  startDate: 1,
  endDate: 1,
  simulationId: 1,
  simulationName: 1
};

export function convertPreplanHeaderEntityToModel(data: PreplanHeaderEntity): PreplanHeaderModel {
  return {
    id: data._id!.toHexString(),
    name: data.name,
    published: data.published,
    finalized: data.finalized,
    userId: data.userId,
    userName: data.userName,
    userDisplayName: data.userDisplayName,
    parentPreplanId: data.parentPreplanId && data.parentPreplanId.toHexString(),
    parentPreplanName: data.parentPreplanName,
    creationDateTime: data.creationDateTime.toJSON(),
    lastEditDateTime: data.lastEditDateTime.toJSON(),
    startDate: data.startDate.toJSON(),
    endDate: data.endDate.toJSON(),
    simulationId: data.simulationId,
    simulationName: data.simulationName
  };
}

export function convertPreplanEntityToModel(data: PreplanEntity, flightRequirements: readonly FlightRequirementEntity[]): PreplanModel {
  return {
    id: data._id!.toHexString(),
    name: data.name,
    published: data.published,
    finalized: data.finalized,
    userId: data.userId,
    userName: data.userName,
    userDisplayName: data.userDisplayName,
    parentPreplanId: data.parentPreplanId && data.parentPreplanId.toHexString(),
    parentPreplanName: data.parentPreplanName,
    creationDateTime: data.creationDateTime.toJSON(),
    lastEditDateTime: data.lastEditDateTime.toJSON(),
    startDate: data.startDate.toJSON(),
    endDate: data.endDate.toJSON(),
    simulationId: data.simulationId,
    simulationName: data.simulationName,
    autoArrangerOptions: data.autoArrangerOptions,
    dummyAircraftRegisters: data.dummyAircraftRegisters,
    aircraftRegisterOptionsDictionary: data.aircraftRegisterOptionsDictionary,
    flightRequirements: flightRequirements.map(convertFlightRequirementEntityToModel)
  };
}
