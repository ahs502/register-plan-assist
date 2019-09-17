import MasterDataItemModel from './MasterDataItemModel';
import ConstraintTemplateType from '@core/types/ConstraintTemplateType';
import ConstraintTemplatePropertyType from '@core/types/ConstraintTemplatePropertyType';

export default interface ConstraintTemplateModel extends MasterDataItemModel {
  readonly type: ConstraintTemplateType;
  readonly instantiable: boolean;
  readonly description: readonly (string | ConstraintTemplatePropertyModel)[];
}

export interface ConstraintTemplatePropertyModel {
  readonly name: string;
  readonly type: ConstraintTemplatePropertyType;
  readonly description: string;
  readonly title?: string;
  readonly required: boolean;
  readonly options?: readonly { title: string; value: string }[]; // For SELECT
  readonly radio?: boolean; // For SELECT
}
