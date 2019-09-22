import MasterDataItem, { MasterDataItems } from './MasterDataItem';
import ConstraintTemplateType from '@core/types/ConstraintTemplateType';
import ConstraintTemplateModel from '@core/models/master-data/ConstraintTemplateModel';

export default class ConstraintTemplate extends MasterDataItem {
  readonly type: ConstraintTemplateType;
  readonly instantiable: boolean;
  readonly description: string;

  constructor(raw: ConstraintTemplateModel) {
    super(raw);
    this.type = raw.type;
    this.instantiable = raw.instantiable;
    let description = raw.description;
    raw.dataFields.forEach((dataField, index) => (description = description.replace(`$${index}`, `(${dataField.description || 'something'})`)));
    this.description = description;
  }
}

export class ConstraintTemplates extends MasterDataItems<ConstraintTemplate> {
  static parse(raw?: readonly ConstraintTemplateModel[]): ConstraintTemplates | undefined {
    if (!raw) return undefined;
    return new ConstraintTemplates(raw.map(x => new ConstraintTemplate(x)));
  }
}
