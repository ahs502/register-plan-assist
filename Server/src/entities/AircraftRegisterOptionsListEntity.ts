import { XmlArray, xmlArray } from 'src/utils/xml';
import AircraftRegisterOptionsEntity, { convertAircraftRegisterOptionsModelToEntity, convertAircraftRegisterOptionsEntityToModel } from './AircraftRegisterOptionsEntity';
import { AircraftRegisterOptionsDictionaryModel } from '@core/models/AircraftRegisterOptionsModel';

export default interface AircraftRegisterOptionsListEntity {
  readonly AircraftRegisterOptions: XmlArray<AircraftRegisterOptionsEntity>;
}

export function convertAircraftRegisterOptionsListModelToEntity(data: AircraftRegisterOptionsDictionaryModel): AircraftRegisterOptionsListEntity {
  return {
    AircraftRegisterOptions: Object.keys(data).map(id => convertAircraftRegisterOptionsModelToEntity(data[id], id))
  };
}

export function convertAircraftRegisterOptionsListEntityToModel(data: AircraftRegisterOptionsListEntity): AircraftRegisterOptionsDictionaryModel {
  return xmlArray(data.AircraftRegisterOptions).toDictionary(a => a._attributes.Id_AircraftRegister, convertAircraftRegisterOptionsEntityToModel);
}
