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
  constructor(data: ClonePreplanHeaderModel, userPreplanIds: readonly Id[], otherPreplanHeaderNames: readonly string[], originalStartDate: Date, originalEndDate: Date) {
    super(validator => {
      const newPreplanHeaderModelValidation = new NewPreplanHeaderModelValidation(data, otherPreplanHeaderNames);
      validator
        .put(validator.$.newPreplanHeader, newPreplanHeaderModelValidation)
        .object(data)
        .then(({ startDate, endDate, sourcePreplanId, includeChanges }) => {
          validator.must(userPreplanIds.includes(sourcePreplanId));
          validator
            .must(typeof includeChanges === 'boolean')
            .if(newPreplanHeaderModelValidation.ok, () => includeChanges)
            .must(
              () => new Date(startDate) <= originalStartDate,
              () => new Date(endDate) >= originalEndDate
            );
        });
    });
  }
}
