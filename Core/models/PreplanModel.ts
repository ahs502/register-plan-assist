import AutoArrangerOptionsModel from './AutoArrangerOptionsModel';
import DummyAircraftRegisterModel from './DummyAircraftRegisterModel';
import FlightRequirementModel from './flight/FlightRequirementModel';
import AutoArrangerStateModel from './AutoArrangerStateModel';
import { AircraftRegisterOptionsDictionaryModel } from './AircraftRegisterOptionsModel';

export interface PreplanHeaderModel {
  readonly id: string;

  readonly name: string;
  readonly published: boolean;
  readonly finalized: boolean;

  readonly userId: string;
  readonly userName: string;
  readonly userDisplayName: string;

  readonly parentPreplanId?: string;
  readonly parentPreplanName?: string;

  readonly creationDateTime: string;
  readonly lastEditDateTime: string;

  readonly startDate: string;
  readonly endDate: string;

  readonly simulationId?: string;
  readonly simulationName?: string;
}

export default interface PreplanModel extends PreplanHeaderModel {
  readonly autoArrangerOptions?: AutoArrangerOptionsModel;
  readonly autoArrangerState: AutoArrangerStateModel;

  readonly dummyAircraftRegisters: readonly DummyAircraftRegisterModel[];
  readonly aircraftRegisterOptionsDictionary: AircraftRegisterOptionsDictionaryModel;

  readonly flightRequirements: readonly FlightRequirementModel[];
}

export interface NewPreplanHeaderModel {
  readonly id: string;
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
}

export interface ModifyPreplanHeaderModel {
  readonly id: string;
  readonly name: string;
  readonly published: boolean;
  readonly startDate: string;
  readonly endDate: string;
}
