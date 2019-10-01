import PreplanHeaderModel from './PreplanHeaderModel';
import DummyAircraftRegisterModel from './DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel from './AircraftRegisterOptionsModel';
import FlightRequirementModel from '@core/models/flight-requirement/FlightRequirementModel';

export default interface PreplanModel extends PreplanHeaderModel {
  readonly dummyAircraftRegisters: readonly DummyAircraftRegisterModel[];
  readonly aircraftRegisterOptions: AircraftRegisterOptionsModel;
  readonly flightRequirements: readonly FlightRequirementModel[];
}
