import MasterDataItemModel from './MasterDataItemModel';
import ConstraintTemplateType from '@core/types/ConstraintTemplateType';
import AircraftSelectionModel from '@core/models/AircraftSelectionModel';

export default interface ConstraintModel extends MasterDataItemModel {
  readonly type: ConstraintTemplateType;
  readonly details: string;
  readonly scope: {
    readonly fromDate?: string;
    readonly toDate?: string;
    readonly seasonTypeId?: string;
    readonly days: readonly boolean[];
  };
  readonly data?:
    | AircraftRestrictionOnAirportsConstraintDataModel
    | AirportRestrictionOnAircraftsConstraintDataModel
    | BlockTimeRestrictionOnAircraftsConstraintDataModel
    | RouteSequenceRestrictionOnAirportsConstraintDataModel
    | AirportAllocationPriorityForAircraftsConstraintDataModel;
}

export interface AircraftRestrictionOnAirportsConstraintDataModel {
  readonly airportIds: readonly string[];
  readonly restriction: 'POSITIVE_PREFERENCE' | 'NEGATIVE_PREFERENCE' | 'POSITIVE_RESTRICTION' | 'NEGATIVE_RESTRICTION';
  readonly aircraftSelection: AircraftSelectionModel;
}
export interface AirportRestrictionOnAircraftsConstraintDataModel {
  readonly aircraftRegisterId: string;
  readonly airportIds: readonly string[];
}
export interface BlockTimeRestrictionOnAircraftsConstraintDataModel {
  readonly maximumBlockTime: number;
  readonly aircraftSelection: AircraftSelectionModel;
}
export interface RouteSequenceRestrictionOnAirportsConstraintDataModel {
  readonly airportId: string;
  readonly nextAirportId: string;
}
export interface AirportAllocationPriorityForAircraftsConstraintDataModel {
  readonly aircraftRegisterIds: readonly string[];
  readonly airportIds: readonly string[];
}
