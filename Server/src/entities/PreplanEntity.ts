import PreplanModel, { PreplanHeaderModel } from '@core/models/PreplanModel';
import { PreplanHeaderEntity } from './PreplanHeadersEntity';
import FlightRequirementEntity from './flight/_FlightRequirementEntity';

export default interface PreplanEntity extends PreplanHeaderEntity {
  readonly AutoArrangerOptions?: string;
  readonly AutoArrangerState: string;
  readonly DummyAircraftRegisters: string;
  readonly AircraftRegisterOptions: string;
}

// export function convertPreplanHeaderEntityToModel(data: PreplanHeaderEntity): PreplanHeaderModel {
//   return {
//     id: data._id!.toHexString(),
//     name: data.name,
//     published: data.published,
//     finalized: data.finalized,
//     userId: data.userId,
//     userName: data.userName,
//     userDisplayName: data.userDisplayName,
//     parentPreplanId: data.parentPreplanId && data.parentPreplanId.toHexString(),
//     parentPreplanName: data.parentPreplanName,
//     creationDateTime: data.creationDateTime.toJSON(),
//     lastEditDateTime: data.lastEditDateTime.toJSON(),
//     startDate: data.startDate.toJSON(),
//     endDate: data.endDate.toJSON(),
//     simulationId: data.simulationId,
//     simulationName: data.simulationName
//   };
// }

export function convertPreplanEntityToModel(data: PreplanEntity, flightRequirements: readonly FlightRequirementEntity[]): PreplanModel {
  return {
    id: data.id.toString(),
    name: data.name,
    published: data.published,
    finalized: data.finalized,
    userId: data.userId,
    userName: data.userName,
    userDisplayName: data.userDisplayName,
    parentPreplanId: data.parentPreplanId && data.parentPreplanId,
    parentPreplanName: data.parentPreplanName,
    creationDateTime: data.creationDateTime,
    lastEditDateTime: data.lastEditDateTime,
    startDate: data.startDate,
    endDate: data.endDate,
    simulationId: data.simulationId,
    simulationName: data.simulationName,
    autoArrangerOptions: undefined, // data.autoArrangerOptions ? convertAutoArrangerOptionsEntityToModel(data.autoArrangerOptions) : undefined,
    autoArrangerState: undefined, //convertAutoArrangerStateEntityToModel(data.autoArrangerState),
    dummyAircraftRegisters: undefined, //data.dummyAircraftRegisters.map(convertDummyAircraftRegisterEntityToModel),
    aircraftRegisterOptionsDictionary: undefined, //convertAircraftRegisterOptionsDictionaryEntityToModel(data.aircraftRegisterOptionsDictionary),
    flightRequirements: undefined //flightRequirements.map(convertFlightRequirementEntityToModel)
  };
}
