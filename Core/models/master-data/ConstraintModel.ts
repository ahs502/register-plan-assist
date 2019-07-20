import MasterDataItemModel from './MasterDataItemModel';
import ConstraintTemplateType from '@core/types/ConstraintTemplateType';
import AircraftSelectionModel from '@core/models/AircraftSelectionModel';

export default interface ConstraintModel extends MasterDataItemModel {
  readonly type: ConstraintTemplateType;
  readonly data: LemaBizuConstraintDataModel | HanaConstraintDataModel | KanjuConstraintDataModel | BartokConstraintDataModel | AlisoConstraintDataModel;
  readonly details: string;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly seasonTypeId?: string;
  readonly days: readonly boolean[];
}

export interface LemaBizuConstraintDataModel {
  readonly airportIds: readonly string[];
  readonly never: boolean;
  readonly aircraftSelection: AircraftSelectionModel;
}
export interface HanaConstraintDataModel {
  readonly maximumBlockTime: number;
  readonly aircraftSelection: AircraftSelectionModel;
}
export interface KanjuConstraintDataModel {
  readonly airportId: string;
  readonly nextAirportId: string;
}
export interface BartokConstraintDataModel {
  readonly aircraftRegisterId: string;
  readonly airportId: string;
}
export interface AlisoConstraintDataModel {
  readonly aircraftRegisterIds: readonly string[];
  readonly airportIds: readonly string[];
}
