import Validation from '@ahs502/validation';
import NewPreplanHeaderModel, { NewPreplanHeaderModelValidation } from '@core/models/preplan/NewPreplanHeaderModel';
import Id from '@core/types/Id';

export default interface ClonePreplanHeaderModel extends NewPreplanHeaderModel {
  readonly sourcePreplanId: Id;
  readonly includeChanges: boolean;
}

export class ClonePreplanHeaderModelValidation extends Validation<
  string,
  {
    newPreplanHeader: NewPreplanHeaderModelValidation;
  }
> {
  constructor(data: ClonePreplanHeaderModel, userPreplanIds: readonly Id[], otherPreplanHeaderNames: readonly string[]) {
    super(validator =>
      validator
        .put(validator.$.newPreplanHeader, new NewPreplanHeaderModelValidation(data, otherPreplanHeaderNames))
        .object(data)
        .then(({ sourcePreplanId, includeChanges }) => {
          validator.must(userPreplanIds.includes(sourcePreplanId));
          validator.must(typeof includeChanges === 'boolean');
        })
    );
  }
}
