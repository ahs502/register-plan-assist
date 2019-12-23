import { Xml, xmlParse, xmlArray, xmlStringify } from 'src/utils/xml';
import PreplanModel from '@core/models/preplan/PreplanModel';
import { convertDummyAircraftRegisterEntityToModel, convertDummyAircraftRegisterModelToEntity } from './DummyAircraftRegisterEntity';
import { convertAircraftRegisterOptionsEntityToModel, convertAircraftRegisterOptionsModelToEntity } from './AircraftRegisterOptionsEntity';
import DummyAircraftRegisterModel from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';
import PreplanVersionEntity, { convertPreplanVersionEntityToModel } from 'src/entities/preplan/PreplanVersionEntity';

export default interface PreplanEntity extends PreplanVersionEntity {
  readonly dummyAircraftRegistersXml: Xml;
  readonly aircraftRegisterOptionsXml: Xml;
}

export function convertPreplanEntityToModel(data: PreplanEntity): PreplanModel {
  return {
    ...convertPreplanVersionEntityToModel(data),
    dummyAircraftRegisters: parsePreplanDummyAircraftRegistersXml(data.dummyAircraftRegistersXml),
    aircraftRegisterOptions: parsePreplanAircraftRegisterOptionsXml(data.aircraftRegisterOptionsXml)
  };
}

export function stringifyPreplanDummyAircraftRegistersXml(data: readonly DummyAircraftRegisterModel[]): Xml {
  return xmlStringify({ DummyAircraftRegister: data.map(convertDummyAircraftRegisterModelToEntity) }, 'DummyAircraftRegisters');
}
export function parsePreplanDummyAircraftRegistersXml(data: Xml): readonly DummyAircraftRegisterModel[] {
  return xmlArray(xmlParse(data, 'DummyAircraftRegisters')['DummyAircraftRegister']).map(convertDummyAircraftRegisterEntityToModel);
}

export function stringifyPreplanAircraftRegisterOptionsXml(data: AircraftRegisterOptionsModel): Xml {
  return xmlStringify(convertAircraftRegisterOptionsModelToEntity(data), 'AircraftRegisterOptions');
}
export function parsePreplanAircraftRegisterOptionsXml(data: Xml): AircraftRegisterOptionsModel {
  return convertAircraftRegisterOptionsEntityToModel(xmlParse(data, 'AircraftRegisterOptions'));
}
