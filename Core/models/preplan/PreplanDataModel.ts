import PreplanModel from '@core/models/preplan/PreplanModel';
import FlightRequirementModel from '@core/models/flight-requirement/FlightRequirementModel';
import FlightModel from '@core/models/flight/FlightModel';
import PreplanHeaderModel from '@core/models/preplan/PreplanHeaderModel';
import PreplanVersionModel from '@core/models/preplan/PreplanVersionModel';

export default interface PreplanDataModel extends PreplanModel {
  readonly header: PreplanHeaderModel;
  readonly versions: readonly PreplanVersionModel[];

  readonly flightRequirements: readonly FlightRequirementModel[];
  readonly flights: readonly FlightModel[];
}
