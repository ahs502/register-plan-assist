import PreplanModel, { PreplanHeaderModel } from '@core/models/PreplanModel';
import { PreplanHeaderEntity, convertPreplanHeaderEntityToModel } from './PreplanHeadersEntity';
import FlightRequirementEntity, { convertFlightRequirementEntityToModel } from './flight/FlightRequirementEntity';
import DummyAircraftRegisterListEntity, { convertDummyAircraftRegisterListEntityToModel } from './DummyAircraftRegisterListEntity';
import AircraftRegisterOptionsListEntity, { convertAircraftRegisterOptionsListEntityToModel } from './AircraftRegisterOptionsListEntity';

export default interface PreplanEntity extends PreplanHeaderEntity {
  readonly AutoArrangerOptions?: string;
  readonly AutoArrangerState: string;
  readonly DummyAircraftRegisters: DummyAircraftRegisterListEntity;
  readonly AircraftRegisterOptions: AircraftRegisterOptionsListEntity;
}

export function convertPreplanEntityToModel(data: PreplanEntity, flightRequirements: readonly FlightRequirementEntity[]): PreplanModel {
  return {
    ...convertPreplanHeaderEntityToModel(data),
    autoArrangerOptions: undefined, // data.autoArrangerOptions ? convertAutoArrangerOptionsEntityToModel(data.autoArrangerOptions) : undefined,
    autoArrangerState: undefined, //convertAutoArrangerStateEntityToModel(data.autoArrangerState),
    dummyAircraftRegisters: convertDummyAircraftRegisterListEntityToModel(data.DummyAircraftRegisters),
    aircraftRegisterOptionsDictionary: convertAircraftRegisterOptionsListEntityToModel(data.AircraftRegisterOptions),
    flightRequirements: flightRequirements.map(convertFlightRequirementEntityToModel)
  };
}
