import NewPreplanHeaderModel, { NewPreplanHeaderModelValidation } from '@core/models/preplan/NewPreplanHeaderModel';
import Id from '@core/types/Id';
import Validation from '@ahs502/validation';

export default interface EditPreplanHeaderModel extends NewPreplanHeaderModel {
  readonly id: Id;
}

export class EditPreplanHeaderModelValidation extends Validation<
  string,
  {
    newPreplanHeader: NewPreplanHeaderModelValidation;
  }
> {
  constructor(data: EditPreplanHeaderModel, otherPreplanHeaderNames: readonly string[], originalStartDate: Date, originalEndDate: Date) {
    super(validator => {
      const newPreplanHeaderModelValidation = new NewPreplanHeaderModelValidation(data, otherPreplanHeaderNames);
      validator
        .put(validator.$.newPreplanHeader, newPreplanHeaderModelValidation)
        .object(data)
        .then(({ startDate, endDate }) =>
          validator.must(
            () => new Date(startDate) <= originalStartDate,
            () => new Date(endDate) >= originalEndDate
          )
        );
    });
  }
}
