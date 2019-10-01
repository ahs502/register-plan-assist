import PreplanHeaderEntity, { convertPreplanHeaderEntityToModel } from './PreplanHeaderEntity';
import { Xml, xmlParse, xmlArray } from 'src/utils/xml';
import PreplanModel from '@core/models/preplan/PreplanModel';
import { convertDummyAircraftRegisterEntityToModel } from './DummyAircraftRegisterEntity';
import { convertFlightRequirementEntityToModel } from 'src/entities/flight-requirement/FlightRequirementEntity';
import { convertAircraftRegisterOptionsEntityToModel } from './AircraftRegisterOptionsEntity';

export default interface PreplanEntity extends PreplanHeaderEntity {
  readonly dummyAircraftRegistersXml: Xml;
  readonly aircraftRegisterOptionsXml: Xml;
  readonly flightRequirementsXml: Xml;
}

export function convertPreplanEntityToModel(data: PreplanEntity): PreplanModel {
  return {
    ...convertPreplanHeaderEntityToModel(data),
    dummyAircraftRegisters: xmlArray(xmlParse(data.dummyAircraftRegistersXml, 'DummyAircraftRegisters').DummyAircraftRegister).map(convertDummyAircraftRegisterEntityToModel),
    aircraftRegisterOptions: convertAircraftRegisterOptionsEntityToModel(xmlParse(data.aircraftRegisterOptionsXml, 'AircraftRegisterOptions')),
    flightRequirements: xmlArray(xmlParse(data.flightRequirementsXml, 'FlightRequirements').FlightRequirement).map(convertFlightRequirementEntityToModel)
  };
}
