import MasterDataItemModel from './MasterDataItemModel';
import ConstraintTemplateType from '@core/types/ConstraintTemplateType';
import AircraftSelectionModel from '@core/models/AircraftSelectionModel';

export default interface ConstraintModel extends MasterDataItemModel {
  readonly type: ConstraintTemplateType;
  readonly data:
    | AircraftRestrictionOnAirportsConstraintDataModel
    | BlickTimeRestrictionOnAircraftsConstraintDataModel
    | RouteSequenceRestrictionOnAirportsConstraintDataModel
    | AirportRestrictionOnAircraftsConstraintDataModel
    | AirportAllocationPriorityForAircraftsConstraintDataModel;
  readonly details: string;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly seasonTypeId?: string;
  readonly days: readonly boolean[];
}

export interface AircraftRestrictionOnAirportsConstraintDataModel {
  readonly airportIds: readonly string[];
  readonly never: boolean;
  readonly aircraftSelection: AircraftSelectionModel;
}
export interface BlickTimeRestrictionOnAircraftsConstraintDataModel {
  readonly maximumBlockTime: number;
  readonly aircraftSelection: AircraftSelectionModel;
}
export interface RouteSequenceRestrictionOnAirportsConstraintDataModel {
  readonly airportId: string;
  readonly nextAirportId: string;
}
export interface AirportRestrictionOnAircraftsConstraintDataModel {
  readonly aircraftRegisterId: string;
  readonly airportId: string;
}
export interface AirportAllocationPriorityForAircraftsConstraintDataModel {
  readonly aircraftRegisterIds: readonly string[];
  readonly airportIds: readonly string[];
}
