import Id from '@core/types/Id';
import PreplanVersionModel from '@core/models/preplan/PreplanVersionModel';
import DummyAircraftRegisterModel from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';

export default interface PreplanModel extends PreplanVersionModel {
  readonly dummyAircraftRegisters: readonly DummyAircraftRegisterModel[];
  readonly aircraftRegisterOptions: AircraftRegisterOptionsModel;
}
