import PreplanHeaderModel from '@core/models/preplan/PreplanHeaderModel';
import DummyAircraftRegisterModel from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';
import FlightRequirementModel from '@core/models/flight-requirement/FlightRequirementModel';
import FlightModel from '@core/models/flight/FlightModel';

export default interface PreplanModel extends PreplanHeaderModel {
  readonly dummyAircraftRegisters: readonly DummyAircraftRegisterModel[];
  readonly aircraftRegisterOptions: AircraftRegisterOptionsModel;
  readonly flightRequirements: readonly FlightRequirementModel[];
  readonly flights: readonly FlightModel[];
}
