import { XmlArray, xmlArray } from 'src/utils/xml';
import DummyAircraftRegisterEntity, { convertDummyAircraftRegisterModelToEntity, convertDummyAircraftRegisterEntityToModel } from './DummyAircraftRegisterEntity';
import DummyAircraftRegisterModel from '@core/models/DummyAircraftRegisterModel';

export default interface DummyAircraftRegisterListEntity {
  readonly DummyAircraftRegisters: XmlArray<DummyAircraftRegisterEntity>;
}

export function convertDummyAircraftRegisterListModelToEntity(data: readonly DummyAircraftRegisterModel[]): DummyAircraftRegisterListEntity {
  return {
    DummyAircraftRegisters: data.map(convertDummyAircraftRegisterModelToEntity)
  };
}

export function convertDummyAircraftRegisterListEntityToModel(data: DummyAircraftRegisterListEntity): readonly DummyAircraftRegisterModel[] {
  return xmlArray(data.DummyAircraftRegisters).map(convertDummyAircraftRegisterEntityToModel);
}
