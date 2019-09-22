import MasterDataItemModel from './MasterDataItemModel';
import ConstraintTemplateType from '@core/types/ConstraintTemplateType';
import ConstraintTemplateDataFieldType from '@core/types/ConstraintTemplateDataFieldType';

export default interface ConstraintTemplateModel extends MasterDataItemModel {
  readonly type: ConstraintTemplateType;
  readonly instantiable: boolean;
  readonly description: string;
  readonly dataFields: readonly {
    readonly type: ConstraintTemplateDataFieldType;
    readonly description: string;
    readonly title?: string;
    readonly selectOptions?: readonly {
      readonly title: string;
      readonly value: string;
    }[]; // For SELECT only
    readonly selectRadio?: boolean; // For SELECT only
  }[];
}
