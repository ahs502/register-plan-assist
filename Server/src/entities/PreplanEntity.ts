import PreplanModel, { PreplanHeaderModel } from '@core/models/PreplanModel';
import { PreplanHeaderEntity, convertPreplanHeaderEntityToModel } from './PreplanHeadersEntity';
import FlightRequirementEntity, { convertFlightRequirementEntityToModel } from './flight/FlightRequirementEntity';
import { convertDummyAircraftRegisterListEntityToModel } from './DummyAircraftRegisterListEntity';
import { convertAircraftRegisterOptionsListEntityToModel } from './AircraftRegisterOptionsListEntity';
import { xmlParse } from 'src/utils/xml';

export default interface PreplanEntity extends PreplanHeaderEntity {
  readonly AutoArrangerOptions?: string;
  readonly AutoArrangerState: string;
  readonly DummyAircraftRegisters: string;
  readonly AircraftRegisterOptions: string;
}

export function convertPreplanEntityToModel(data: PreplanEntity, flightRequirements: readonly FlightRequirementEntity[]): PreplanModel {
  return {
    ...convertPreplanHeaderEntityToModel(data),
    autoArrangerOptions: undefined, // data.autoArrangerOptions ? convertAutoArrangerOptionsEntityToModel(data.autoArrangerOptions) : undefined,
    autoArrangerState: { solving: false, messageViewed: true, changeLogs: [], changeLogsViewed: true }, //convertAutoArrangerStateEntityToModel(data.autoArrangerState),
    dummyAircraftRegisters: convertDummyAircraftRegisterListEntityToModel(xmlParse(data.DummyAircraftRegisters, 'DummyAircraftRegisters')),
    aircraftRegisterOptionsDictionary: convertAircraftRegisterOptionsListEntityToModel(xmlParse(data.AircraftRegisterOptions, 'AircraftRegistersOptions')),
    flightRequirements: flightRequirements.map(convertFlightRequirementEntityToModel)
  };
}
