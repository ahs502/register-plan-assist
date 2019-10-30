import MasterDataItemModel from './MasterDataItemModel';
import ConstraintTemplateType from '@core/types/ConstraintTemplateType';
import AircraftSelectionModel from '@core/models/AircraftSelectionModel';
import Id from '@core/types/Id';

export default interface ConstraintModel extends MasterDataItemModel {
  readonly type: ConstraintTemplateType;
  readonly details: string;
  readonly scope: {
    readonly fromDate?: string;
    readonly toDate?: string;
    readonly seasonTypeId?: Id;
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
  readonly airportIds: readonly Id[];
  readonly restriction: 'POSITIVE_PREFERENCE' | 'NEGATIVE_PREFERENCE' | 'POSITIVE_RESTRICTION' | 'NEGATIVE_RESTRICTION';
  readonly aircraftSelection: AircraftSelectionModel;
}
export interface AirportRestrictionOnAircraftsConstraintDataModel {
  readonly aircraftRegisterId: Id;
  readonly airportIds: readonly Id[];
}
export interface BlockTimeRestrictionOnAircraftsConstraintDataModel {
  readonly maximumBlockTime: number;
  readonly aircraftSelection: AircraftSelectionModel;
}
export interface RouteSequenceRestrictionOnAirportsConstraintDataModel {
  readonly airportId: Id;
  readonly nextAirportId: Id;
}
export interface AirportAllocationPriorityForAircraftsConstraintDataModel {
  readonly aircraftRegisterIds: readonly Id[];
  readonly airportIds: readonly Id[];
}
